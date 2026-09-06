import Stripe from "stripe";
import { Request, Response } from "express";

import config from "../../config";
import prisma from "../lib/prisma";

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: "2025-02-24.acacia" as any,
});

const round2 = (n: number): number => Math.round(n * 100) / 100;

const logEvent = (
  type: string,
  id: string,
  extra?: Record<string, unknown>,
) => {
  console.log(`[Stripe Webhook] ${type} | event: ${id}`, extra ?? "");
};

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> => {
  const { paymentTransactionId, userId } = session.metadata ?? {};

  if (!paymentTransactionId || !userId) {
    console.error(
      "[Stripe Webhook] checkout.session.completed — missing metadata",
      { paymentTransactionId, userId },
    );
    return;
  }

  logEvent("checkout.session.completed", eventId, {
    paymentTransactionId,
    sessionId: session.id,
  });

  try {
    const transaction = await prisma.gemPurchaseTransaction.findUnique({
      where: { id: paymentTransactionId },
    });

    if (transaction && transaction.status !== "SUCCESS") {
      await prisma.$transaction([
        prisma.gemPurchaseTransaction.update({
          where: { id: paymentTransactionId },
          data: { status: "SUCCESS" },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { gems: { increment: transaction.amount } },
        }),
      ]);
      logEvent("checkout.session.completed — DB updated", eventId, { paymentTransactionId, userId });
    }
  } catch (error) {
    console.error("[Stripe Webhook] DB update failed", error);
  }
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent,
  eventId: string,
): Promise<void> => {
  logEvent("payment_intent.succeeded", eventId, { piId: paymentIntent.id });
};

const handleChargeSucceeded = async (
  charge: Stripe.Charge,
  eventId: string,
): Promise<void> => {
  logEvent("charge.succeeded", eventId, { chargeId: charge.id });

  if (!charge.payment_intent) return;
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
  eventId: string,
): Promise<void> => {
  const orderId = paymentIntent.metadata?.orderId;
  logEvent("payment_intent.payment_failed", eventId, {
    orderId,
    piId: paymentIntent.id,
  });
};

const handleChargeRefunded = async (
  charge: Stripe.Charge,
  eventId: string,
): Promise<void> => {
  logEvent("charge.refunded", eventId, { chargeId: charge.id });
};

const handleAccountUpdated = (
  account: Stripe.Account,
  eventId: string,
): void => {
  const fullyOnboarded =
    account.charges_enabled &&
    account.details_submitted &&
    account.payouts_enabled;

  logEvent("account.updated", eventId, {
    accountId: account.id,
    fullyOnboarded,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });

  if (fullyOnboarded) {
    console.log(
      `[Stripe Webhook] Vendor account ${account.id} is fully onboarded`,
    );
  }
};

export const handleWebHook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    res
      .status(400)
      .json({ success: false, message: "Missing Stripe signature header" });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhook_secret as string,
    );
  } catch (err: any) {
    console.error(
      "[Stripe Webhook] Signature verification failed:",
      err.message,
    );
    res.status(400).send(`Webhook signature error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.id,
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          event.id,
        );
        break;

      case "charge.succeeded":
        await handleChargeSucceeded(
          event.data.object as Stripe.Charge,
          event.id,
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
          event.id,
        );
        break;

      case "charge.refunded":
      case "charge.refund.updated":
        await handleChargeRefunded(
          event.data.object as Stripe.Charge,
          event.id,
        );
        break;

      case "account.updated":
        handleAccountUpdated(event.data.object as Stripe.Account, event.id);
        break;

      case "payment_intent.created":
      case "customer.created":
      case "capability.updated":
      case "account.application.authorized":
      case "account.external_account.created":
      case "financial_connections.account.created":
      case "transfer.created":
        logEvent(`${event.type} (acknowledged, no action)`, event.id);
        break;

      default:
        console.log(
          `[Stripe Webhook] Unhandled event type: ${event.type} | id: ${event.id}`,
        );
    }
  } catch (handlerError: any) {
    console.error(
      `[Stripe Webhook] Handler error for event ${event.type} (${event.id}):`,
      handlerError,
    );
    res.status(500).json({
      success: false,
      message: "Webhook handler encountered an error",
    });
    return;
  }

  res.status(200).json({ received: true });
};

export default handleWebHook;

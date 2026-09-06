import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis";
import sentEmailUtility from "../utils/sentEmailUtility";
import { otpEmailTemplate } from "../helpers/otpTemplate";
import {
  passwordChangedSuccessTemplate,
  passwordResetOtpTemplate,
} from "../helpers/passwordResetTemplate";

export interface IEmailJobData {
  email: string;
  fullName: string;
  otp?: string;
  type: "OTP_VERIFICATION" | "PASSWORD_RESET_OTP" | "PASSWORD_CHANGED_NOTIFICATION";
}

export const EMAIL_QUEUE_NAME = "email-queue";

export const emailQueue = new Queue<IEmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const enqueueOtpEmail = async (
  email: string,
  fullName: string,
  otp: string
): Promise<void> => {
  try {
    await emailQueue.add("send-otp-email", {
      email,
      fullName,
      otp,
      type: "OTP_VERIFICATION",
    });
  } catch (queueErr) {
    console.warn("⚠️ BullMQ queueing failed, falling back to direct async delivery:", queueErr);
    const html = otpEmailTemplate(fullName, otp);
    sentEmailUtility(
      email,
      "Verify Your Email - Verification Code",
      `Your verification code is: ${otp}. It expires in 5 minutes.`,
      html
    ).catch((mailErr) => {
      console.error("❌ Direct email fallback also failed:", mailErr);
    });
  }
};

export const enqueuePasswordResetEmail = async (
  email: string,
  fullName: string,
  otp: string
): Promise<void> => {
  try {
    await emailQueue.add("send-password-reset-email", {
      email,
      fullName,
      otp,
      type: "PASSWORD_RESET_OTP",
    });
  } catch (queueErr) {
    console.warn("⚠️ BullMQ queueing failed, falling back to direct async delivery:", queueErr);
    const html = passwordResetOtpTemplate(fullName, otp);
    sentEmailUtility(
      email,
      "Password Reset Request - Verification Code",
      `Your password reset code is: ${otp}. It expires in 5 minutes.`,
      html
    ).catch((mailErr) => {
      console.error("❌ Direct email fallback also failed:", mailErr);
    });
  }
};

export const enqueuePasswordChangedEmail = async (
  email: string,
  fullName: string
): Promise<void> => {
  try {
    await emailQueue.add("send-password-changed-email", {
      email,
      fullName,
      type: "PASSWORD_CHANGED_NOTIFICATION",
    });
  } catch (queueErr) {
    console.warn("⚠️ BullMQ queueing failed, falling back to direct async delivery:", queueErr);
    const html = passwordChangedSuccessTemplate(fullName);
    sentEmailUtility(
      email,
      "Security Alert: Your Password Was Changed",
      "The password for your account was successfully updated.",
      html
    ).catch((mailErr) => {
      console.error("❌ Direct email fallback also failed:", mailErr);
    });
  }
};

export let emailWorker: Worker<IEmailJobData> | null = null;

export const initEmailWorker = (): Worker<IEmailJobData> => {
  if (emailWorker) return emailWorker;

  emailWorker = new Worker<IEmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<IEmailJobData>) => {
      const { email, fullName, otp, type } = job.data;
      console.log(`[BullMQ] Processing job ${job.id}: (${type}) for ${email}`);

      if (type === "OTP_VERIFICATION") {
        const html = otpEmailTemplate(fullName, otp || "");
        await sentEmailUtility(
          email,
          "Verify Your Email - Verification Code",
          `Your verification code is: ${otp}. It expires in 5 minutes.`,
          html
        );
      } else if (type === "PASSWORD_RESET_OTP") {
        const html = passwordResetOtpTemplate(fullName, otp || "");
        await sentEmailUtility(
          email,
          "Password Reset Request - Verification Code",
          `Your password reset code is: ${otp}. It expires in 5 minutes.`,
          html
        );
      } else if (type === "PASSWORD_CHANGED_NOTIFICATION") {
        const html = passwordChangedSuccessTemplate(fullName);
        await sentEmailUtility(
          email,
          "Security Alert: Your Password Was Changed",
          "The password for your account was successfully updated.",
          html
        );
      }

      console.log(`[BullMQ] Job ${job.id} completed successfully for ${email}`);
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  emailWorker.on("failed", (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} failed with error:`, err.message);
  });

  emailWorker.on("error", (err) => {
    console.warn("[BullMQ] Worker connection error:", err.message);
  });

  return emailWorker;
};

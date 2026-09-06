import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis";
import sentEmailUtility from "../utils/sentEmailUtility";
import { otpEmailTemplate } from "../helpers/otpTemplate";

export interface IEmailJobData {
  email: string;
  fullName: string;
  otp: string;
  type: "OTP_VERIFICATION";
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


export let emailWorker: Worker<IEmailJobData> | null = null;

export const initEmailWorker = (): Worker<IEmailJobData> => {
  if (emailWorker) return emailWorker;

  emailWorker = new Worker<IEmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<IEmailJobData>) => {
      const { email, fullName, otp } = job.data;
      console.log(`[BullMQ] Processing job ${job.id}: Sending OTP email to ${email}`);

      const html = otpEmailTemplate(fullName, otp);
      await sentEmailUtility(
        email,
        "Verify Your Email - Verification Code",
        `Your verification code is: ${otp}. It expires in 5 minutes.`,
        html
      );

      console.log(`[BullMQ] Job ${job.id} completed: Email sent to ${email}`);
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

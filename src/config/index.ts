import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || "12",
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  emailSender: {
    email: process.env.EMAIL_SENDER_EMAIL || process.env.EMAIL,
    app_pass: process.env.EMAIL_SENDER_APP_PASS || process.env.EMAIL_PASSWORD,
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  otp: {
    expires_in_minutes: Number(process.env.OTP_ACCESS_EXPIRES_IN) || 5,
  },
};

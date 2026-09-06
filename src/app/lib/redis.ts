import Redis from "ioredis";
import config from "../../config";

export const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redisConnection.on("error", (err) => {
  console.warn("⚠️ Redis Connection Warning:", err.message);
});

redisConnection.on("connect", () => {
  console.log("Redis connected successfully.");
});

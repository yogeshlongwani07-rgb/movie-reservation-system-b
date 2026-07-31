const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

module.exports = redisClient;

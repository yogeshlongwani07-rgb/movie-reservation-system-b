const Redis = require("ioredis");

function createMockRedisClient() {
  const store = new Map();
  return {
    on() {},
    async incr(key) {
      const nextValue = (Number(store.get(key)) || 0) + 1;
      store.set(key, nextValue);
      return nextValue;
    },
    async expire() {
      return 1;
    },
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async set(key, value) {
      store.set(key, value);
      return "OK";
    },
    async del(...keys) {
      let deleted = 0;
      keys.forEach((key) => {
        if (store.delete(key)) deleted += 1;
      });
      return deleted;
    },
    async quit() {
      store.clear();
      return "OK";
    },
  };
}

const redisClient =
  process.env.NODE_ENV === "test" || !process.env.REDIS_URL
    ? createMockRedisClient()
    : new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = redisClient;

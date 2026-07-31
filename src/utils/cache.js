const redisClient = require("../config/redisio");

const DEFAULT_TTL_SECONDS = 60;

async function getCache(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error("Redis cache read failed:", err.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("Redis cache write failed:", err.message);
  }
}

async function deleteCache(...keys) {
  const validKeys = keys.filter(Boolean);
  if (validKeys.length === 0) return;

  try {
    await redisClient.del(validKeys);
  } catch (err) {
    console.error("Redis cache delete failed:", err.message);
  }
}

async function deleteCacheByPattern(pattern) {
  try {
    const stream = redisClient.scanStream({ match: pattern, count: 100 });

    for await (const keys of stream) {
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (err) {
    console.error("Redis cache pattern delete failed:", err.message);
  }
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
};

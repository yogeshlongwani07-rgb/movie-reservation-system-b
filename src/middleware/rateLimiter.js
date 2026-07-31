const redisClient = require("../config/redisio");

const limit = 10;
const window = 60;

async function limiter(req, res, next) {
  try {
    const ip = req.ip;
    const key = `rate:${ip}`;
    const count = await redisClient.incr(key);
    if (count == 1) {
      await redisClient.expire(key, window);
    }
    if (count > limit) {
      return res.status(429).json({
        message: "Too Many Requests",
      });
    }
  } catch (err) {
    console.error("Redis rate limit skipped:", err.message);
  }
  next();
}

module.exports = { limiter };

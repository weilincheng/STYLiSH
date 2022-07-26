const RATE_LIMIT = 10;
const WINDOW_TIME = 1;
const client = require("../model/redis.js");
const uuid = require("uuid").v4;

const incrCount = async (key) => {
  const requests = await client.incr(key);
  if (requests === 1) {
    await client.expire(key, WINDOW_TIME);
  }
  return requests;
};

const rateLimiter = () => {
  return async (req, res, next) => {
    const key = req.ip;
    const requests = await incrCount(key);
    if (requests > RATE_LIMIT) {
      return res.status(429).json({ error: "Too many requests" });
    } else {
      next();
    }
  };
};

const rateLimiterSortedList = () => {
  return async (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const [zremrangeReply, zrangeReply, zaddReply] = await client
      .multi()
      .ZREMRANGEBYSCORE(key, 0, now - WINDOW_TIME * 1000)
      .ZRANGE(key, 0, -1)
      .ZADD(key, { score: now, value: uuid() })
      .EXPIRE(key, WINDOW_TIME)
      .exec();

    if (zrangeReply.length >= RATE_LIMIT) {
      return res.status(429).json({ error: "Too many requests" });
    } else {
      next();
    }
  };
};

module.exports = { rateLimiter, rateLimiterSortedList };

const Redis = require('ioredis');
const redis = new Redis();

function rateLimit(maxRequests, windowMs) {
  return async (req, res, next) => {
    const clientIp = req.ip; 
    const key = `rate_limit:${clientIp}`; 

    try {
      const currentRequests = await redis.incr(key);

      if (currentRequests === 1) {
        await redis.expire(key, windowMs / 1000); 
      }

      if (currentRequests > maxRequests) {
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}

module.exports = { rateLimit };
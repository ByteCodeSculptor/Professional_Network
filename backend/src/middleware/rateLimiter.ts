import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';

// Create a custom store using Redis
const createRedisStore = () => {
  return {
    async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
      const hits = await redis.incr(key);
      if (hits === 1) {
        await redis.expire(key, 60); // 1 minute window
      }
      const ttl = await redis.ttl(key);
      const resetTime = new Date(Date.now() + ttl * 1000);
      return { totalHits: hits, resetTime };
    },
    async decrement(key: string): Promise<void> {
      await redis.decr(key);
    },
    async resetKey(key: string): Promise<void> {
      await redis.del(key);
    },
  };
};

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute for authenticated users
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health';
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 search requests per minute
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 file uploads per minute
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
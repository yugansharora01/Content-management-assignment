import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

export const getRateLimiter = () => rateLimit({
  windowMs: 60 * 1000,
  max: 100, // Limit each IP to 100 requests per `window` (here, per minute)
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});
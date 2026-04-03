import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { config } from "../config";

// Skip rate limiting entirely in development so local work is never blocked
const skipInDevelopment = (_req: Request) => config.nodeEnv === "development";

/**
 * General API Rate Limiter
 * Limits each IP to a configured number of requests per window
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  skip: skipInDevelopment,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for auth endpoints (login/register)
 * Prevents brute-force attacks in production.
 * Skipped entirely in development.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per 15 min (production guard)
  skip: skipInDevelopment,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

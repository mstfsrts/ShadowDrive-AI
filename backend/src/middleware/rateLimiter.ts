// ─── Rate Limiter Middleware ───

import rateLimit from 'express-rate-limit';

/** General API rate limiter: 100 requests per 15 minutes */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Gemini generate endpoint: 20 requests per 15 minutes (free tier) */
export const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many generation requests. Please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Auth endpoints: 10 attempts per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

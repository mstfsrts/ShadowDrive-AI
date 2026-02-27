// ─── ShadowDrive AI — Shared Constants ───

/** Gemini model candidates in order of preference */
export const MODEL_CANDIDATES = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
] as const;

/** Timeout for Gemini API calls (ms) */
export const GEMINI_TIMEOUT_MS = 15_000;

/** Max output tokens for Gemini */
export const GEMINI_MAX_TOKENS = 1500;

/** Supported languages */
export const LANGUAGES = {
  TARGET: { code: 'nl-NL', name: 'Dutch' },
  NATIVE: { code: 'tr-TR', name: 'Turkish' },
} as const;

/** Cache key prefix for localStorage */
export const CACHE_PREFIX = 'shadowdrive_';

/** JWT token key for localStorage */
export const TOKEN_KEY = 'shadowdrive_token';

/** API endpoints */
export const API_ROUTES = {
  GENERATE: '/api/generate',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  PROGRESS: '/api/progress',
  FAVORITES: '/api/favorites',
  COURSES: '/api/courses',
  HEALTH: '/api/health',
} as const;

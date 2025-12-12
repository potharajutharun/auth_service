import rateLimit from "express-rate-limit";

// Global limiter (for all routes, if you want it)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 100 requests per 15 min per IP
  message: {
    message: "Too many attempts, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for auth endpoints (login/register/refresh)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 auth attempts per 15 minutes per IP
  message: {
    message: "Too many attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

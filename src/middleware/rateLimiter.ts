import rateLimit from "express-rate-limit";

// Global limiter (for all routes, if you want it)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min per IP
  message: {
    message: "Too many attempts, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for sensitive auth endpoints.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth attempts per 15 minutes per IP
  message: {
    message: "Too many attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OAuth redirects can generate several requests quickly (redirects/retries).
export const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: {
    message: "Too many OAuth attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import { Router } from "express";
import { authController } from "../../controllers/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.dto";
import { authenticate } from "../../middleware/authenticate";
import { authLimiter } from "../../middleware/rateLimiter";

import {
  redirectToGoogle,
  googleCallback,
} from "../../controllers/google.auth.controller";

const router = Router();
// src/domain/auth/auth.routes.ts
router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  authController.register
);
router.post(
  "/login",
  authLimiter,
  validateRequest(loginSchema),
  authController.login
);
router.post("/refreshtoken", authController.refresh);
router.post("/logout", authLimiter, authController.logout);
router.post(
  "/forgotpassword",
  authLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/resetpassword",
  authLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);
router.post("/verify-email", authLimiter, authController.verifyEmail);
router.get("/verify-email", authLimiter, authController.verifyEmail);
router.get("/me", authenticate, authController.me);

router.get("/google", authLimiter, redirectToGoogle);
router.get("/google/callback", authLimiter, googleCallback);

export default router;

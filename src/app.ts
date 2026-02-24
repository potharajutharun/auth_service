import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./domain/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { globalLimiter } from "./middleware/rateLimiter";
import { env } from "./config/env";
import cookieParser from "cookie-parser";

export const createApp = () => {
  const app = express();
  const isBehindProxy =
    env.app.nodeEnv === "production" ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_EXTERNAL_URL);

  if (isBehindProxy) {
    // Required on Render/proxy setups so rate-limit uses the real client IP.
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.app.frontendUrl, // e.g. http://localhost:3000
      credentials: true, // ⬅️ REQUIRED for cookies
    })
  );

  app.use(cookieParser());  
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(globalLimiter);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/v1/auth", authRoutes);

  app.use(errorHandler);

  return app;
};

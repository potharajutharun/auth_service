import dotenv from "dotenv";
dotenv.config();

/**
 * Ensures required env vars exist
 */
const required = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const normalizeOrigin = (value: string): string =>
  value.trim().replace(/\/+$/, "");

export const env = {
  app: {
    port: parseInt(process.env.PORT || "4000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: normalizeOrigin(
      required(process.env.APP_FRONTEND_URL, "APP_FRONTEND_URL")
    ),
  },

  db: {
    host: required(process.env.DB_HOST, "DB_HOST"),
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: required(process.env.DB_USER, "DB_USER"),
    password: required(process.env.DB_PASS, "DB_PASS"),
    name: required(process.env.DB_NAME, "DB_NAME"),
  },

  jwt: {
    accessSecret: required(
      process.env.JWT_ACCESS_SECRET,
      "JWT_ACCESS_SECRET"
    ),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

    refreshSecret: required(
      process.env.JWT_REFRESH_SECRET,
      "JWT_REFRESH_SECRET"
    ),
    refreshTtlDays: parseInt(
      process.env.JWT_REFRESH_TTL_DAYS || "7",
      10
    ),

    issuer: "universal-auth",
    audience: "universal-auth-client",
  },

  bcrypt: {
    rounds: parseInt(
      process.env.BCRYPT_SALT_ROUNDS || "10",
      10
    ),
  },

  mail: {
    host: required(process.env.SMTP_HOST, "SMTP_HOST"),
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: required(process.env.SMTP_USER, "SMTP_USER"),
    pass: required(process.env.SMTP_PASS, "SMTP_PASS"),
    from: required(process.env.SMTP_FROM, "SMTP_FROM"),
  },

  googleOauth: {
    clientId: required(
      process.env.OAUTH_GOOGLE_CLIENT_ID,
      "OAUTH_GOOGLE_CLIENT_ID"
    ),
    clientSecret: required(
      process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      "OAUTH_GOOGLE_CLIENT_SECRET"
    ),
    redirectUri: required(
      process.env.OAUTH_GOOGLE_REDIRECT_URI,
      "OAUTH_GOOGLE_REDIRECT_URI"
    ),
  },

  security: {
    emailVerificationTtlMinutes: parseInt(
      process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES || "30",
      10
    ),
    resetPasswordTtlMinutes: parseInt(
      process.env.RESET_PASSWORD_TOKEN_TTL_MINUTES ||
        process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES ||
        "30",
      10
    ),
    refreshTokenRotation:
      process.env.REFRESH_TOKEN_ROTATION === "true",
  },
};

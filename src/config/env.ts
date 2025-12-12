import dotenv from "dotenv";
dotenv.config();

const required = (v: string | undefined, name: string) => {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),

  db: {
    host: required(process.env.DB_HOST, "DB_HOST"),
    user: required(process.env.DB_USER, "DB_USER"),
    password: required(process.env.DB_PASS, "DB_PASS"),
    name: required(process.env.DB_NAME, "DB_NAME"),
  },

  jwt: {
    accessSecret: required(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshSecret: required(
      process.env.JWT_REFRESH_SECRET,
      "JWT_REFRESH_SECRET"
    ),
    refreshTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS || "7", 10),
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },
  mail: {
    host: required(process.env.SMTP_HOST, "SMTP_HOST"),
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: required(process.env.SMTP_USER, "SMTP_USER"),
    pass: required(process.env.SMTP_PASS, "SMTP_PASS"),
    from: required(process.env.SMTP_FROM, "SMTP_FROM"),
  },
  app: {
    frontendUrl: required(process.env.APP_FRONTEND_URL, "APP_FRONTEND_URL"),

    nodeEnv: process.env.NODE_ENV || "development",
  },
  googleOauth: {
    googleclientid: required(
      process.env.OAUTH_GOOGLE_CLIENT_ID,
      "OAUTH_GOOGLE_CLIENT_ID"
    ),
    gooleclientsecret: required(
      process.env.OAUTH_GOOGLE_SECRET_ID,
      "OAUTH_GOOGLE_SECRET_ID"
    ),
    gooleredirecturl: required(
      process.env.OAUTH_GOOGLE_REDIRECT_URI,
      "OAUTH_GOOGLE_REDIRECT_URI"
    ),
  },
};

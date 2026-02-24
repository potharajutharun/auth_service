import fs from "fs";
import mysql from "mysql2/promise";
import { env } from "./env";

const ssl =
  process.env.DB_SSL === "true"
    ? process.env.DB_SSL_CA_PATH
      ? {
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
          rejectUnauthorized: true,
        }
      : { rejectUnauthorized: true }
    : undefined;

export const db = mysql.createPool({
  host: env.db.host,
  port: env.db.port, // important for Aiven (your port is 11478)
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
});

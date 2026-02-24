import crypto from "crypto";
import { db } from "../config/db";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const refreshTokenRepository = {
  async create(userId: number, token: string, tenant_id: number, expiresAt: Date) {
    const tokenHash = hashToken(token);
    const [result]: any = await db.query(
      "INSERT INTO refresh_tokens (user_id, tenant_id, token, expires_at) VALUES (?, ?, ?, ?)",
      [userId, tenant_id, tokenHash, expiresAt]
    );
    return {
      id: result.insertId,
      userId,
      token,
      expiresAt
    };
  },

  async findValidByToken(token: string) {
    const tokenHash = hashToken(token);
    const [rows] = await db.query(
      `SELECT * FROM refresh_tokens
       WHERE token = ?
         AND revoked_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
    return (rows as any[])[0] || null;
  },

  async revokeById(id: number) {
    await db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL",
      [id]
    );
  },

  async revokeByToken(token: string) {
    const tokenHash = hashToken(token);
    await db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ? AND revoked_at IS NULL",
      [tokenHash]
    );
  },

  async revokeAllForUser(userId: number) {
    await db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL",
      [userId]
    );
  }
};

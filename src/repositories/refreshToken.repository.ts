import { db } from "../config/db";

export const refreshTokenRepository = {
  async create(userId: number, token: string, expiresAt: Date) {
    const [result]: any = await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );
    return {
      id: result.insertId,
      userId,
      token,
      expiresAt
    };
  },

  async findValidByToken(token: string) {
    const [rows] = await db.query(
      `SELECT * FROM refresh_tokens
       WHERE token = ?
         AND is_revoked = 0
         AND expires_at > NOW()
       LIMIT 1`,
      [token]
    );
    return (rows as any[])[0] || null;
  },

  async revokeById(id: number) {
    await db.query(
      "UPDATE refresh_tokens SET is_revoked = 1, revoked_at = NOW() WHERE id = ?",
      [id]
    );
  },

  async revokeByToken(token: string) {
    await db.query(
      "UPDATE refresh_tokens SET is_revoked = 1, revoked_at = NOW() WHERE token = ?",
      [token]
    );
  },

  async revokeAllForUser(userId: number) {
    await db.query(
      "UPDATE refresh_tokens SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ?",
      [userId]
    );
  }
};

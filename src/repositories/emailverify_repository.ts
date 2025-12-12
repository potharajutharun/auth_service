import { db } from "../config/db";

export interface EmailVerificationType {
  user_id: number;
  token: string;
  expires_at: Date | string;
  used_at: Date | string | null;
}

export const emailverification_repository = {
  async create({ user_id, token, expires_at, used_at }: EmailVerificationType) {
    const [result]: any = await db.query(
      `
      INSERT INTO email_verifications (user_id, token, expires_at, used_at) 
      VALUES (?, ?, ?, ?) 
      `,
      [user_id, token, expires_at, used_at]
    );

    // return insert id for caller to verify success
    return result.insertId;
  },

  async markTokenUsed(user_id: number, used_at: Date | string) {
    const [result]: any = await db.query(
      `
      UPDATE email_verifications 
      SET used_at = ? 
      WHERE user_id = ? 
        AND used_at IS NULL
      `,
      [used_at, user_id]
    );

    // Return how many rows updated (0 or 1)
    return result.affectedRows || 0;
  },

  async findByToken(token: string) {
    const [rows]: any = await db.query(
      `
      SELECT *
      FROM email_verifications
      WHERE token = ?
      LIMIT 1
      `,
      [token]
    );

    return rows.length ? rows[0] : null;
  }
};

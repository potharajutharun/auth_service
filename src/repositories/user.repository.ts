import { db } from "../config/db";

export interface UserRecord {
  id: number;
  role_id: number;
  role_name: string;
  name: string;
  email: string;
  password?: string;
  status: "active" | "inactive" | "blocked"; // from user_status.name
  created_at: Date;
  updated_at: Date;
  google_id: string | null;
  is_email_verified: 0 | 1; // mysql tinyint(1)
}

const ACTIVE_STATUS_ID = 1; // adjust if your user_status table uses different id

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await db.query(
      `SELECT 
         u.id,
         u.role_id,
         r.name AS role_name,
         u.name,
         u.email,
         u.password,
         us.name AS status,
         u.created_at,
         u.updated_at,
         u.google_id,
         u.is_email_verified
       FROM users u
       JOIN roles r ON r.id = u.role_id
       JOIN user_status us ON us.id = u.status_id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );
    return (rows as UserRecord[])[0] || null;
  },

  async findById(id: number): Promise<UserRecord | null> {
    const [rows] = await db.query(
      `SELECT 
         u.id,
         u.role_id,
         r.name AS role_name,
         u.name,
         u.email,
         us.name AS status,
         u.created_at,
         u.updated_at,
         u.google_id,
         u.is_email_verified
       FROM users u
       JOIN roles r ON r.id = u.role_id
       JOIN user_status us ON us.id = u.status_id
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    );
    return (rows as UserRecord[])[0] || null;
  },

  async createUser(data: {
    email: string;
    password: string;
    roleId: number;
  }) {
    const [result]: any = await db.query(
      "INSERT INTO users (email, password, role_id) VALUES ( ?, ?, ?)",
      [data.email, data.password, data.roleId]
    );
    return {
      id: result.insertId,
      email: data.email,
      role_id: data.roleId,
    };
  },

  async findByGoogleId(googleId: string): Promise<UserRecord | null> {
    const [rows] = await db.query(
      `SELECT 
         u.id,
         u.role_id,
         r.name AS role_name,
         u.name,
         u.email,
         u.password,
         us.name AS status,
         u.created_at,
         u.updated_at,
         u.google_id,
         u.is_email_verified
       FROM users u
       JOIN roles r ON r.id = u.role_id
       JOIN user_status us ON us.id = u.status_id
       WHERE u.google_id = ?
       LIMIT 1`,
      [googleId]
    );
    return (rows as UserRecord[])[0] || null;
  },

  // ▶ For Google-only accounts
  async createUserFromGoogle(data: {
    name: string;
    email: string;
    passwordHash: string; // random hashed password
    roleId: number;
    googleId: string;
    isEmailVerified: boolean;
  }): Promise<UserRecord> {
    const [result]: any = await db.query(
      `INSERT INTO users 
        (name, email, password, role_id, status_id, google_id, is_email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.email,
        data.passwordHash,
        data.roleId,
        ACTIVE_STATUS_ID,                  // always create as active
        data.googleId,
        data.isEmailVerified ? 1 : 0,
      ]
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error("FAILED_TO_FETCH_CREATED_USER");
    }
    return created;
  },

  async linkGoogleAccount(
    userId: number,
    googleId: string,
    isEmailVerified: boolean
  ): Promise<UserRecord> {
    await db.query(
      `UPDATE users 
       SET google_id = ?, is_email_verified = ?
       WHERE id = ?`,
      [googleId, isEmailVerified ? 1 : 0, userId]
    );

    const updated = await this.findById(userId);
    if (!updated) {
      throw new Error("FAILED_TO_FETCH_UPDATED_USER");
    }
    return updated;
  },
};

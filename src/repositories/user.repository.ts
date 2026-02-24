import { PoolConnection } from "mysql2/promise";
import { db } from "../config/db";

export interface UserRecord {
  id: number;
  tenant_id: number;
  role_id: number | null;
  role_name: string | null;
  name: string | null;
  email: string;
  password?: string;
  status_id: string;
  status_name: string | null;
  created_at: Date;
  updated_at: Date;
  google_id: string | null;
  is_email_verified: 0 | 1; // mysql tinyint(1)
}

const ACTIVE_STATUS_ID = "1"; // adjust if your user_status table uses different id

const BASE_USER_SELECT = `
  SELECT
    u.id,
    u.tenant_id,
    ur.role_id,
    r.name AS role_name,
    u.name,
    u.email,
    u.password,
    CAST(u.status_id AS CHAR) AS status_id,
    us.name AS status_name,
    u.created_at,
    u.updated_at,
    u.google_id,
    u.is_email_verified
  FROM users u
  LEFT JOIN user_roles ur
    ON ur.user_id = u.id
   AND ur.tenant_id = u.tenant_id
  LEFT JOIN roles r
    ON r.id = ur.role_id
   AND r.tenant_id = ur.tenant_id
  LEFT JOIN user_status us
    ON us.id = CAST(u.status_id AS UNSIGNED)
`;

const insertUserRole = async (
  connection: PoolConnection,
  userId: number,
  roleId: number,
  tenantId: number
) => {
  await connection.query(
    `INSERT INTO user_roles (user_id, role_id, tenant_id)
     VALUES (?, ?, ?)`,
    [userId, roleId, tenantId]
  );
};

export const userRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await db.query(
      `${BASE_USER_SELECT}
       WHERE u.email = ?
       ORDER BY ur.role_id ASC
       LIMIT 1`,
      [email],
    );
    return (rows as UserRecord[])[0] || null;
  },

  async findById(id: number): Promise<UserRecord | null> {
    const [rows] = await db.query(
      `${BASE_USER_SELECT}
       WHERE u.id = ?
       ORDER BY ur.role_id ASC
       LIMIT 1`,
      [id],
    );
    return (rows as UserRecord[])[0] || null;
  },

  async createUser(data: {
    email: string;
    password: string;
    tenant_id: number;
    roleId: number;
  }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result]: any = await connection.query(
        `INSERT INTO users (tenant_id, email, password, status_id, is_email_verified, auth_provider)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.tenant_id, data.email, data.password, ACTIVE_STATUS_ID, 0, "local"],
      );

      await insertUserRole(connection, result.insertId, data.roleId, data.tenant_id);

      await connection.commit();
      return {
        id: result.insertId,
        email: data.email,
        tenant_id: data.tenant_id
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findByGoogleId(googleId: string): Promise<UserRecord | null> {
    const [rows] = await db.query(
      `${BASE_USER_SELECT}
       WHERE u.google_id = ?
       ORDER BY ur.role_id ASC
       LIMIT 1`,
      [googleId],
    );
    return (rows as UserRecord[])[0] || null;
  },

  // For Google-only accounts
  async createUserFromGoogle(data: {
    name: string;
    email: string;
    passwordHash: string; // random hashed password
    roleId: number;
    tenantId: number;
    googleId: string;
    isEmailVerified: boolean;
  }): Promise<UserRecord> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result]: any = await connection.query(
        `INSERT INTO users
          (tenant_id, name, email, password, status_id, google_id, is_email_verified, auth_provider, email_verified_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.tenantId,
          data.name,
          data.email,
          data.passwordHash,
          ACTIVE_STATUS_ID, // always create as active
          data.googleId,
          data.isEmailVerified ? 1 : 0,
          "google",
          data.isEmailVerified ? new Date() : null,
        ],
      );

      await insertUserRole(connection, result.insertId, data.roleId, data.tenantId);
      await connection.commit();

      const created = await this.findById(result.insertId);
      if (!created) {
        throw new Error("FAILED_TO_FETCH_CREATED_USER");
      }
      return created;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async linkGoogleAccount(
    userId: number,
    googleId: string,
    isEmailVerified: boolean,
  ): Promise<UserRecord> {
    await db.query(
      `UPDATE users
       SET google_id = ?,
           auth_provider = 'google',
           is_email_verified = ?,
           email_verified_at = CASE
             WHEN ? = 1 THEN COALESCE(email_verified_at, NOW())
             ELSE email_verified_at
           END
       WHERE id = ?`,
      [googleId, isEmailVerified ? 1 : 0, isEmailVerified ? 1 : 0, userId],
    );

    const updated = await this.findById(userId);
    if (!updated) {
      throw new Error("FAILED_TO_FETCH_UPDATED_USER");
    }
    return updated;
  },

  async markEmailVerified(userId: number) {
    const [result]: any = await db.query(
      `UPDATE users
       SET is_email_verified = 1,
           email_verified_at = COALESCE(email_verified_at, NOW())
       WHERE id = ?`,
      [userId]
    );
    return result.affectedRows || 0;
  },

  async updatePasswordById(userId: number, passwordHash: string) {
    const [result]: any = await db.query(
      `UPDATE users
       SET password = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [passwordHash, userId]
    );
    return result.affectedRows || 0;
  },
};

// src/models/userModel.ts
import { db } from "../config/db.js";
import type { RowDataPacket } from "mysql2";

console.log("🧩 userModel.ts LOADED");

export interface User extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  password: string; // hashed password
  tenant_id: number;
  role?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Role extends RowDataPacket {
  role_id: number;
  role_key: string;
}

// Find User By Email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await db.query<User[]>("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  console.log("🔎 findUserByEmail RESULT rows:", rows);

  return rows[0] || null;
};

// Find User By ID
export const findUserById = async (id: number): Promise<User | null> => {
  console.log("🔎 findUserById CALLED with:", id);

  const [rows] = await db.query<User[]>(
    "SELECT * FROM users WHERE user_id = ?",
    [id]
  );

  return rows[0] || null;
};

// Get Role By User ID
export const getRoleByUserId = async (
  user_id: number
): Promise<Role | null> => {
  console.log("✅ getRoleByUserId CALLED with:", user_id);

  const [rows] = await db.query<Role[]>(
    `
    SELECT 
      r.role_id,
      r.role_key
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = ?
    LIMIT 1
    `,
    [user_id]
  );

  return rows[0] || null;
};

export const createUser = async (email: string, password_hash: string) => {
  const [result] = await db.query(
    "INSERT INTO users (email,password_hash) VALUES (?,?)",
    [email, password_hash]
  );
  return result;
};

export const deleteOldResetTokens = async (userId: number) => {
  await db.query(`DELETE FROM user_password_reset WHERE user_id = ?`, [userId]);
};
export const saveResetToken = async (
  userId: number,
  token: string,
  expiresAt: Date
) => {
  const [result] = await db.query(
    `INSERT INTO user_password_reset (user_id, reset_token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt]
  );
  return result;
};


export const findValidResetToken = async (token: string) => {
  const [rows] = await db.query(
    `SELECT id, user_id, reset_token, expires_at
     FROM user_password_reset
     WHERE reset_token = ?
       AND expires_at > NOW()
     LIMIT 1`,
    [token]
  );

  const records = rows as any[];
  return records.length ? records[0] : null;
};

export const updateUserPasswordById = async (
  userId: number | string,
  passwordHash: string
) => {
  const [result] = await db.query(
    "UPDATE users SET password_hash = ? WHERE user_id = ?",
    [passwordHash, userId]
  );
  return result as any; // mysql2 ResultSetHeader
};

 export const GetAllusers=async()=>{
  const [result]=await db.query('select * from users');
  return result as any;
 }
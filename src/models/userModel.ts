// src/models/userModel.ts
import { db } from "../config/db.js";
import type { RowDataPacket } from "mysql2";

console.log("🧩 userModel.ts LOADED");

export interface User extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  password: string;      // hashed password
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
  console.log("🔎 findUserByEmail CALLED with:", email);

  const [rows] = await db.query<User[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

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

  console.log("🔎 findUserById RESULT rows:", rows);

  return rows[0] || null;
};

// Get Role By User ID
export const getRoleByUserId = async (user_id: number): Promise<Role | null> => {
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

  console.log("🔍 getRoleByUserId RESULT rows:", rows);

  return rows[0] || null;
};

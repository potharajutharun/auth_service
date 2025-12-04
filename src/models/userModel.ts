import { db } from "../config/db.js";
import type { RowDataPacket } from "mysql2";

// ----------------------------------
// User Interface (match your DB)
// ----------------------------------
export interface User extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  password: string;
  tenant_id: number;
  role: string;
  created_at: Date;
  updated_at: Date;
  // Add more fields if your table has them
}

// ----------------------------------
// Find User By Email
// ----------------------------------
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await db.query<User[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  // console.log('Database query result for email', email, ':', rows);

  return rows[0] || null;
};

// ----------------------------------
// Find User By ID
// ----------------------------------
export const findUserById = async (id: number): Promise<User | null> => {
  const [rows] = await db.query<User[]>(
    "SELECT * FROM users WHERE user_id = ?",
    [id]
  );

  return rows[0] || null;
};

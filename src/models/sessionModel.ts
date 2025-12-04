import { db } from "../config/db.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// ---------------------------
//  Type definitions
// ---------------------------

export interface SessionData {
  user_id: number;
  tenant_id: number;
  jwt_id: string;
  ip_address: string;
  device_name: string;
  user_agent: string;
  refresh_token: string;
}

// ---------------------------
//  Create Session
// ---------------------------

export const createSession = async (sessionData: SessionData): Promise<void> => {
  const {
    user_id,
    tenant_id,
    jwt_id,
    ip_address,
    device_name,
    user_agent,
    refresh_token,
  } = sessionData;

  await db.query<ResultSetHeader>(
    `INSERT INTO sessions 
      (user_id, tenant_id, jwt_id, ip_address, device_name, user_agent, refresh_token) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, tenant_id, jwt_id, ip_address, device_name, user_agent, refresh_token]
  );
};

// ---------------------------
//  Find Session
// ---------------------------

export const findSessionByJwtId = async (jwt_id: string) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM sessions WHERE jwt_id = ?",
    [jwt_id]
  );

  return rows[0] || null;
};

// ---------------------------
//  Deactivate Session
// ---------------------------

export const deactivateSession = async (jwt_id: string): Promise<void> => {
  await db.query<ResultSetHeader>(
    "UPDATE sessions SET logout_at = NOW() WHERE jwt_id = ?",
    [jwt_id]
  );
};

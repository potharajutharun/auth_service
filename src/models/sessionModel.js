import {db} from '../config/db.js';

export const createSession = async (sessionData) => {
  const {
    user_id,
    tenant_id,
    jwt_id,
    ip_address,
    device_name,
    user_agent,
    refresh_token,
  } = sessionData;

  await db.query(
    `INSERT INTO sessions 
      (user_id, tenant_id, jwt_id, ip_address, device_name, user_agent, refresh_token) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, tenant_id, jwt_id, ip_address, device_name, user_agent, refresh_token]
  );
};

export const findSessionByJwtId = async (jwt_id) => {
  const [rows] = await db.query('SELECT * FROM sessions WHERE jwt_id = ?', [jwt_id]);
  return rows[0];
};

export const deactivateSession = async (jwt_id) => {
  await db.query('UPDATE sessions SET logout_at = NOW() WHERE jwt_id = ?', [jwt_id]);
};

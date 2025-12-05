// src/models/userModel.ts
import { db } from "../config/db.js";
console.log("🧩 userModel.ts LOADED");
// Find User By Email
export const findUserByEmail = async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
    ]);
    console.log("🔎 findUserByEmail RESULT rows:", rows);
    return rows[0] || null;
};
// Find User By ID
export const findUserById = async (id) => {
    console.log("🔎 findUserById CALLED with:", id);
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
    return rows[0] || null;
};
// Get Role By User ID
export const getRoleByUserId = async (user_id) => {
    console.log("✅ getRoleByUserId CALLED with:", user_id);
    const [rows] = await db.query(`
    SELECT 
      r.role_id,
      r.role_key
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = ?
    LIMIT 1
    `, [user_id]);
    return rows[0] || null;
};
export const createUser = async (email, password_hash) => {
    const [result] = await db.query("INSERT INTO users (email,password_hash) VALUES (?,?)", [email, password_hash]);
    return result;
};
export const deleteOldResetTokens = async (userId) => {
    await db.query(`DELETE FROM user_password_reset WHERE user_id = ?`, [userId]);
};
export const saveResetToken = async (userId, token, expiresAt) => {
    const [result] = await db.query(`INSERT INTO user_password_reset (user_id, reset_token, expires_at)
     VALUES (?, ?, ?)`, [userId, token, expiresAt]);
    return result;
};
export const findValidResetToken = async (token) => {
    const [rows] = await db.query(`SELECT id, user_id, reset_token, expires_at
     FROM user_password_reset
     WHERE reset_token = ?
       AND expires_at > NOW()
     LIMIT 1`, [token]);
    const records = rows;
    return records.length ? records[0] : null;
};
export const updateUserPasswordById = async (userId, passwordHash) => {
    const [result] = await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [passwordHash, userId]);
    return result; // mysql2 ResultSetHeader
};
export const GetAllusers = async () => {
    const [result] = await db.query('select * from users');
    return result;
};
//# sourceMappingURL=userModel.js.map
// src/models/userModel.ts
import { db } from "../config/db.js";
console.log("🧩 userModel.ts LOADED");
// Find User By Email
export const findUserByEmail = async (email) => {
    console.log("🔎 findUserByEmail CALLED with:", email);
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    console.log("🔎 findUserByEmail RESULT rows:", rows);
    return rows[0] || null;
};
// Find User By ID
export const findUserById = async (id) => {
    console.log("🔎 findUserById CALLED with:", id);
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
    console.log("🔎 findUserById RESULT rows:", rows);
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
    console.log("🔍 getRoleByUserId RESULT rows:", rows);
    return rows[0] || null;
};
//# sourceMappingURL=userModel.js.map
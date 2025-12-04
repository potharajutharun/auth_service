import { db } from "../config/db.js";
// ----------------------------------
// Find User By Email
// ----------------------------------
export const findUserByEmail = async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    // console.log('Database query result for email', email, ':', rows);
    return rows[0] || null;
};
// ----------------------------------
// Find User By ID
// ----------------------------------
export const findUserById = async (id) => {
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
    return rows[0] || null;
};
//# sourceMappingURL=userModel.js.map
import { db } from "../config/db";

export const roleRepository = {
  async findByName(name: string) {
    const [rows] = await db.query(
      "SELECT id FROM roles WHERE name = ? LIMIT 1",
      [name]
    );
    return (rows as any[])[0] || null;
  }
};

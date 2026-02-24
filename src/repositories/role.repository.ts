import { db } from "../config/db";

interface RoleRecord {
  id: number;
  name: string;
  tenant_id: number;
  is_system: 0 | 1;
}

export const roleRepository = {
  
  async findByName(name: string, tenantId?: number): Promise<RoleRecord | null> {
    if (tenantId !== undefined) {
      const [rows] = await db.query(
        `SELECT id, name, tenant_id, is_system
         FROM roles
         WHERE LOWER(name) = LOWER(?)
           AND (tenant_id = ? OR is_system = 1)
         ORDER BY CASE WHEN tenant_id = ? THEN 0 ELSE 1 END
         LIMIT 1`,
        [name, tenantId, tenantId]
      );
      return (rows as RoleRecord[])[0] || null;
    }

    const [rows] = await db.query(
      `SELECT id, name, tenant_id, is_system
       FROM roles
       WHERE LOWER(name) = LOWER(?)
       LIMIT 1`,
      [name]
    );
    return (rows as RoleRecord[])[0] || null;
  },
};

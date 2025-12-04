import type { RowDataPacket } from "mysql2";
export interface User extends RowDataPacket {
    user_id: number;
    name: string;
    email: string;
    password: string;
    tenant_id: number;
    role: string;
    created_at: Date;
    updated_at: Date;
}
export declare const findUserByEmail: (email: string) => Promise<User | null>;
export declare const findUserById: (id: number) => Promise<User | null>;
//# sourceMappingURL=userModel.d.ts.map
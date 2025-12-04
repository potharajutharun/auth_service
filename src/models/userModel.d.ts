import type { RowDataPacket } from "mysql2";
export interface User extends RowDataPacket {
    user_id: number;
    name: string;
    email: string;
    password: string;
    tenant_id: number;
    role?: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface Role extends RowDataPacket {
    role_id: number;
    role_key: string;
}
export declare const findUserByEmail: (email: string) => Promise<User | null>;
export declare const findUserById: (id: number) => Promise<User | null>;
export declare const getRoleByUserId: (user_id: number) => Promise<Role | null>;
export declare const createUser: (email: string, password_hash: string) => Promise<import("mysql2").QueryResult>;
export declare const deleteOldResetTokens: (userId: number) => Promise<void>;
export declare const saveResetToken: (userId: number, token: string, expiresAt: Date) => Promise<import("mysql2").QueryResult>;
export declare const findValidResetToken: (token: string) => Promise<any>;
export declare const updateUserPasswordById: (userId: number | string, passwordHash: string) => Promise<any>;
//# sourceMappingURL=userModel.d.ts.map
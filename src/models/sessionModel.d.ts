import type { RowDataPacket } from "mysql2";
export interface SessionData {
    user_id: number;
    tenant_id: number;
    jwt_id: string;
    ip_address: string;
    device_name: string;
    user_agent: string;
    refresh_token: string;
}
export declare const createSession: (sessionData: SessionData) => Promise<void>;
export declare const findSessionByJwtId: (jwt_id: string) => Promise<RowDataPacket | null>;
export declare const deactivateSession: (jwt_id: string) => Promise<void>;
//# sourceMappingURL=sessionModel.d.ts.map
interface AuthUser {
    user_id: number;
    email: string;
    role_id: number;
    role_key?: string;
}
interface LoginResult {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}
export declare const loginUserService: (email: string, password: string) => Promise<LoginResult>;
declare const _default: {
    loginUserService: (email: string, password: string) => Promise<LoginResult>;
};
export default _default;
//# sourceMappingURL=loginServices.d.ts.map
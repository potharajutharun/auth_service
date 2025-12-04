interface AuthUser {
    id: string;
    email: string;
    role_id: string;
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
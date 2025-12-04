interface User {
    user_id: string;
    email: string;
    role_id: string;
}
export declare const generateAccessToken: (user: User) => string;
export declare const generateRefreshToken: (user: User) => string;
export {};
//# sourceMappingURL=generateToken.d.ts.map
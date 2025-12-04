interface User {
    user_id: number;
    email: string;
    role_id: number;
}
export declare const generateAccessToken: (user: User) => string;
export declare const generateRefreshToken: (user: User) => string;
export {};
//# sourceMappingURL=generateToken.d.ts.map
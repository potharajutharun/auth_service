export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}
type ResetPasswordResult = {
    success: boolean;
    message: string;
};
export declare const resetPasswordService: ({ token, newPassword, }: ResetPasswordInput) => Promise<ResetPasswordResult>;
export {};
//# sourceMappingURL=resetPasswordService.d.ts.map
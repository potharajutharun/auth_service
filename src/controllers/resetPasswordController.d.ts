import type { Request, Response } from "express";
export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}
export declare const resetPasswordController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=resetPasswordController.d.ts.map
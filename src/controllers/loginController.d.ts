import type { Request, Response } from "express";
interface LoginRequestBody {
    email: string;
    password: string;
}
export declare const loginController: (req: Request<{}, {}, LoginRequestBody>, res: Response) => Promise<Response>;
export {};
//# sourceMappingURL=loginController.d.ts.map
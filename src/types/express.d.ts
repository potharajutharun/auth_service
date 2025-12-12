import { JwtBasePayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      // payload from JWT + optional iat/exp fields
      user?: JwtBasePayload & {
        iat?: number;
        exp?: number;
      };
    }
  }
}

// Make this file a module so TS actually includes it
export {};

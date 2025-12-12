import bcrypt from "bcryptjs";
import { env } from "../config/env";

export const passwordUtils = {
  async hash(plain: string) {
    const salt = await bcrypt.genSalt(env.bcrypt.rounds);
    return bcrypt.hash(plain, salt);
  },

  async compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
};

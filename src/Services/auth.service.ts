import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { roleRepository } from "../repositories/role.repository";
import { jwtUtils } from "../utils/jwt";
import { env } from "../config/env";
import { passwordUtils } from "../utils/password";
import { emailverification } from "./emailverification";
import { mailService } from "./mail.service";

const buildRefreshExpiryDate = () => {
  const now = Date.now();
  const days = env.jwt.refreshTtlDays;
  return new Date(now + days * 24 * 60 * 60 * 1000);
};

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register({ email, password }: RegisterInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("EMAIL_EXISTS");

    // default role = 'user'
    const role = await roleRepository.findByName("user");
    if (!role) {
      throw new Error("ROLE_USER_MISSING");
    }

    const hashed = await passwordUtils.hash(password);

    const user = await userRepository.createUser({
      email,
      password: hashed,
      roleId: role.id,
    });
    const verificationToken = await emailverification(user.id);
    console.log(verificationToken);
    const resp = await mailService.sendEmailVerification(
      user.email,
      verificationToken
    );

    const accessToken = jwtUtils.signAccessToken({
      sub: user.id,
      email: user.email,
      role: "user",
    });

    const refreshToken = jwtUtils.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: "user",
    });

    await refreshTokenRepository.create(
      user.id,
      refreshToken,
      buildRefreshExpiryDate()
    );
    

    return {
      user: {
        id: user.id,
        email: user.email,
        role: "user",
      },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }: LoginInput) {
    console.log(email, password);
    const user = await userRepository.findByEmail(email);
    console.log(user, "lll");
    if (!user) throw new Error("INVALID");

    if (user.status !== "active") {
      throw new Error("USER_INACTIVE");
    }

    const ok = await passwordUtils.compare(password, user.password!);
    console.log(ok, "ppp");
    if (!ok) throw new Error("INVALID");

    const accessToken = jwtUtils.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role_name,
    });

    const refreshToken = jwtUtils.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role_name,
    });

    await refreshTokenRepository.create(
      user.id,
      refreshToken,
      buildRefreshExpiryDate()
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshTokens(refreshToken: string) {
    let payload;
    try {
      payload = jwtUtils.verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("INVALID_REFRESH");
    }

    const stored = await refreshTokenRepository.findValidByToken(refreshToken);
    if (!stored) throw new Error("INVALID_REFRESH");

    if (stored.user_id !== payload.sub) {
      await refreshTokenRepository.revokeById(stored.id);
      throw new Error("INVALID_REFRESH");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || user.status !== "active") {
      await refreshTokenRepository.revokeById(stored.id);
      throw new Error("USER_INACTIVE");
    }

    // Rotate
    await refreshTokenRepository.revokeById(stored.id);

    const newAccessToken = jwtUtils.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role_name,
    });

    const newRefreshToken = jwtUtils.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role_name,
    });

    await refreshTokenRepository.create(
      user.id,
      newRefreshToken,
      buildRefreshExpiryDate()
    );

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(refreshToken: string) {
    await refreshTokenRepository.revokeByToken(refreshToken);
  },

  async me(id: number) {
    return userRepository.findById(id);
  },
};

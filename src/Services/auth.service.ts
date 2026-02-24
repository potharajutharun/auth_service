import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { roleRepository } from "../repositories/role.repository";
import { jwtUtils } from "../utils/jwt";
import { env } from "../config/env";
import { passwordUtils } from "../utils/password";
import { emailverification } from "./emailverification";
import { mailService } from "./mail.service";
import { emailverification_repository } from "../repositories/emailverify_repository";

const isActiveUser = (user: { status_id?: string; status_name?: string | null }) => {
  if (user.status_name) {
    return user.status_name.toLowerCase() === "active";
  }
  return user.status_id === "1";
};

const buildRefreshExpiryDate = () => {
  const now = Date.now();
  const days = env.jwt.refreshTtlDays;
  return new Date(now + days * 24 * 60 * 60 * 1000);
};

interface RegisterInput {
  email: string;
  password: string;
  tenant_id: number;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export const authService = {
  async register({ email, password, tenant_id }: RegisterInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("EMAIL_EXISTS");

    const role = await roleRepository.findByName("User", tenant_id);
    if (!role) {
      throw new Error("ROLE_USER_MISSING");
    }

    const hashed = await passwordUtils.hash(password);

    const user = await userRepository.createUser({
      email,
      password: hashed,
      tenant_id,
      roleId: role.id,
    });
    const verificationToken = await emailverification(user.id);
    await mailService.sendEmailVerification(
      user.email,
      verificationToken
    );

    const accessToken = jwtUtils.signAccessToken({
      sub: user.id,
      email: user.email,
      role: role.name,
    });

    const refreshToken = jwtUtils.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: role.name,
    });

    await refreshTokenRepository.create(
      user.id,
      refreshToken,
      user.tenant_id,
      buildRefreshExpiryDate()
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: role.name,
      },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("INVALID");

    if (!isActiveUser(user)) {
      throw new Error("USER_INACTIVE");
    }

    if (!user.password) {
      throw new Error("INVALID");
    }

    const ok = await passwordUtils.compare(password, user.password);
    if (!ok) throw new Error("INVALID");
    const resolvedRole = user.role_name ?? "User";

    const accessToken = jwtUtils.signAccessToken({
      sub: user.id,
      email: user.email,
      role: resolvedRole,
    });

    const refreshToken = jwtUtils.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: resolvedRole,
    });

    await refreshTokenRepository.create(
      user.id,
      refreshToken,
      user.tenant_id,
      buildRefreshExpiryDate()
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: resolvedRole,
        status: user.status_name ?? user.status_id,
      },
      accessToken,
      refreshToken,
    };
  },

  async forgotPassword({ email }: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(email);

    // Return success even for unknown emails to avoid account enumeration.
    if (!user) {
      return;
    }

    const resetToken = jwtUtils.signPasswordResetToken({
      sub: user.id,
      email: user.email,
    });

    // Fire-and-forget to keep forgot-password responses fast and generic.
    void mailService
      .sendPasswordResetEmail(user.email, resetToken)
      .catch((error) => {
        // Keep response generic to avoid account enumeration behavior changes.
        console.error("FAILED_TO_SEND_PASSWORD_RESET_EMAIL:", error);
      });
  },

  async resetPassword({ token, newPassword }: ResetPasswordInput) {
    let payload;
    try {
      payload = jwtUtils.verifyPasswordResetToken(token);
    } catch (err: any) {
      if (err?.name === "TokenExpiredError") {
        throw new Error("RESET_TOKEN_EXPIRED");
      }
      throw new Error("RESET_TOKEN_INVALID");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || user.email !== payload.email) {
      throw new Error("RESET_TOKEN_INVALID");
    }

    const hashed = await passwordUtils.hash(newPassword);
    const updated = await userRepository.updatePasswordById(user.id, hashed);
    if (!updated) {
      throw new Error("USER_NOT_FOUND");
    }

    await refreshTokenRepository.revokeAllForUser(user.id);
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
    if (!user || !isActiveUser(user)) {
      await refreshTokenRepository.revokeById(stored.id);
      throw new Error("USER_INACTIVE");
    }
    const resolvedRole = user.role_name ?? "User";

    // Rotate
    await refreshTokenRepository.revokeById(stored.id);

    const newAccessToken = jwtUtils.signAccessToken({
      sub: user.id,
      email: user.email,
      role: resolvedRole,
    });

    const newRefreshToken = jwtUtils.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: resolvedRole,
    });

    await refreshTokenRepository.create(
      user.id,
      newRefreshToken,
      user.tenant_id,
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

  async verifyEmailToken(token: string) {
    const verification = await emailverification_repository.findByToken(token);
    if (!verification) {
      throw new Error("EMAIL_VERIFICATION_INVALID");
    }

    if (verification.used_at) {
      throw new Error("EMAIL_VERIFICATION_USED");
    }

    const expiresAt = new Date(verification.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      throw new Error("EMAIL_VERIFICATION_EXPIRED");
    }

    const markedUsed = await emailverification_repository.markTokenUsedByToken(
      token,
      new Date()
    );
    if (!markedUsed) {
      throw new Error("EMAIL_VERIFICATION_USED");
    }

    const updatedUser = await userRepository.markEmailVerified(verification.user_id);
    if (!updatedUser) {
      throw new Error("USER_NOT_FOUND");
    }
  },

  async me(id: number) {
    return userRepository.findById(id);
  },
};

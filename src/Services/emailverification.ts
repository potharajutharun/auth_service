import { emailverification_repository } from "../repositories/emailverify_repository";
import ranToken from "../utils/randomToken";

export async function emailverification(userId: number): Promise<string> {
  const token = ranToken();
  if (!token) {
    throw new Error("FAILED_UNIQUE_KEY_GENERATION");
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  const usedAt = null;

  const verificationData = {
    user_id: userId,
    token,
    expires_at: expiresAt,
    used_at: usedAt,
  };

  // repo returns insertId: number
  const insertId = await emailverification_repository.create(verificationData);

  if (!insertId) {
    throw new Error("EMAIL_VERIFICATION_SAVE_FAILED");
  }

  // return token so caller (service) can send it via email
  return token;
}

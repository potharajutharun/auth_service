import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

interface User {
  user_id: number;
  email: string;
  role_id: string;
}

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Fail fast if env variables missing
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables');
}

export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role_id,
      jti: uuidv4(), // unique per token
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.user_id,
      jti: uuidv4(),
    },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

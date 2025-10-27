import { v4 as uuidv4 } from 'uuid';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role_id,
      jti: uuidv4() // unique per token
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      jti: uuidv4()
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

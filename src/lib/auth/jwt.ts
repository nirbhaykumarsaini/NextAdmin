import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION } from '@/constants/index';

export const generateToken = (userId: string | JwtPayload | undefined, type: 'access' | 'refresh') => {
  const secret = JWT_SECRET;
  const expiresIn = type === 'access' ? JWT_ACCESS_EXPIRATION : JWT_REFRESH_EXPIRATION;
  
  return jwt.sign({ sub: userId }, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
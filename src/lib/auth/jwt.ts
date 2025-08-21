import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION } from '@/constants/index';

export const generateToken = (userId: string | JwtPayload | undefined) => {
  const secret = JWT_SECRET;
  
  return jwt.sign({ sub: userId }, secret, {
    expiresIn:"10d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
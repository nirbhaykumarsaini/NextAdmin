import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@/constants/index';

export const generateToken = (userId: string | JwtPayload | undefined) => {
  const secret = JWT_SECRET;
  
  return jwt.sign({ sub: userId }, secret);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
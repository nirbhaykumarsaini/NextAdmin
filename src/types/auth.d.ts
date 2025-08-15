
import { Types } from 'mongoose';



export interface ILogin {
  username: string;
  password: string;
}

export interface IRegister {
  username: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface IToken {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  type: 'refresh' | 'resetPassword' | 'verifyEmail';
  blacklisted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
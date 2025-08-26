
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


export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge?: number; // Changed from string to number
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
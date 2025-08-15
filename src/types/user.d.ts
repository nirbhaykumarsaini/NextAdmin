// types/user.ts
import { Document } from 'mongoose';

export interface IUser {
  username: string;
  password: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  // Add other document methods here if needed
}

declare module 'next' {
  interface NextApiRequest {
    user?: IUserDocument;
  }
}
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  username: string;
  password: string;
  role?: 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const userSchema = new Schema<IUserDocument, Model<IUserDocument>>(
  {
    username: { 
      type: String, 
      trim: true,
      unique: true
    },
    password: { 
      type: String, 
      select: false 
    },
    role: { 
      type: String, 
      enum: ['admin'], 
      default: 'admin' 
    }
  },
  { 
    timestamps: true,
  }
);

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

export default User;
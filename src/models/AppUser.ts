import mongoose, { Document, Model, Schema } from 'mongoose'; 
import bcrypt from 'bcryptjs'; 

export interface IAppUser {
  name: string;
  mobile_number: string;
  password: string;
  otp: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAppUserDocument extends IAppUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const appUserSchema = new Schema<IAppUserDocument, Model<IAppUserDocument>>(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    mobile_number: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    otp: {
      type: String,
      trim: true,
      default: '1234'
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

appUserSchema.pre<IAppUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

appUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const AppUser = mongoose.models.AppUser || mongoose.model<IAppUserDocument>('AppUser', appUserSchema);
export default AppUser;
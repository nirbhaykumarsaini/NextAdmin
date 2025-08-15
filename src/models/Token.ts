import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IToken {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  type: 'refresh' | 'resetPassword' | 'verifyEmail';
  blacklisted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document interface that extends IToken and Mongoose Document
export interface ITokenDocument extends IToken, Document {}

// Model interface
interface ITokenModel extends Model<ITokenDocument> {}

const tokenSchema = new Schema<ITokenDocument, ITokenModel>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    token: { 
      type: String, 
      required: true 
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['refresh', 'resetPassword', 'verifyEmail'], 
      required: true 
    },
    blacklisted: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true,
   
  }
);

const Token = mongoose.models.User || mongoose.model<ITokenDocument, ITokenModel>('Token', tokenSchema);
export default Token;
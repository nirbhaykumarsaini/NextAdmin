import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";

export interface IFund {
  user_id: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}


const fundSchema = new Schema<IFund>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'AppUser',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    description: {
      type: String,
    }
  }, 
  { 
    timestamps: { 
      createdAt: 'created_at', 
      updatedAt: 'updated_at' 
    } 
  }
);

const Fund = mongoose.models.Fund || mongoose.model<IFund>('Fund', fundSchema);
export default Fund;
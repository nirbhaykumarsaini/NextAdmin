import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";

export interface IWithdrawal {
  user_id: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}


const withdrawalSchema = new Schema<IWithdrawal>(
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
      enum: ['pending', 'rejected', 'approved'],
      default: 'pending'
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

const Withdrawal = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);
export default Withdrawal;
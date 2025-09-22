import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";
import '@/models/WithdrawalMethod'
import '@/models/Transaction'

export interface IWithdrawal {
  user_id: Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  withdrawal_method_id: Types.ObjectId;
  transaction_id: Types.ObjectId;
}


const withdrawalSchema = new Schema<IWithdrawal>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'AppUser',
      required: true,
    },
    withdrawal_method_id: {
      type: Schema.Types.ObjectId,
      ref: "WithdrawalMethod",
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
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
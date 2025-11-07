import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";
import "@/models/Transaction";

export interface IFund {
  user_id: Types.ObjectId;
  transaction_id: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  fund_type: 'phonepay' | 'googlepay' | 'paytmpay' | 'airtal' | 'navi' | 'sbi' | 'whatsapp' | 'idfcbank';
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  transactionId:string;
}


const fundSchema = new Schema<IFund>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'AppUser',
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    fund_type: {
      type: String,
      enum: ['phonepay', 'googlepay', 'paytmpay', 'airtal', 'navi', 'sbi', 'whatsapp', 'idfcbank']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    description: {
      type: String,
    },
    transactionId: {
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
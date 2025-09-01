import mongoose, { Schema, Types } from "mongoose";

export interface ITransaction {
  user_id: Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ITransactionDocument extends ITransaction, Document {}

const transactionSchema = new Schema<ITransactionDocument>(
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
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
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

const Transaction = mongoose.models.Transaction || mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
export default Transaction;
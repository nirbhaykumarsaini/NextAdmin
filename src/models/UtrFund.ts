import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";
import "@/models/Transaction";

export interface IFund {
    user_id: Types.ObjectId;
    transaction_id: Types.ObjectId;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: Date;
    updated_at?: Date;
    utr_id: string;
    payment_image:string;
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
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        utr_id: {
            type: String,
        },
        payment_image: {
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
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Fund from '@/models/Fund';
import mongoose, { Types } from 'mongoose';
import AccountSetting from '@/models/AccountSettings';

interface AddFundRequest {
    amount: number;
    description?: string;
    user_id: Types.ObjectId;
}


export async function POST(
    request: Request
) {
    try {
        await dbConnect();


        const body: AddFundRequest = await request.json();
        const { user_id, amount, description } = body;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new ApiError('Invalid user ID');
        }

        if (!amount || amount <= 0) throw new ApiError('Amount must be greater than 0');
        if (amount > 100000) throw new ApiError('Amount cannot exceed ₹100,000');

        const user = await AppUser.findById(user_id);
        if (!user) throw new ApiError('User not found');
        if (user.is_blocked) throw new ApiError('Cannot add funds to blocked user');

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update user balance
            user.balance += amount;
            await user.save({ session });

            // Save Transaction
            const transaction = new Transaction({
                user_id: user._id,
                amount,
                type: 'credit',
                status: 'completed',
                description: description || `Funds added by admin`
            });
            await transaction.save({ session });

            // Save Fund record
            const fund = new Fund({
                user_id: user._id,
                amount,
                status: 'completed',
                description: description || 'Funds added'
            });
            await fund.save({ session });

            await session.commitTransaction();
            session.endSession();

            return NextResponse.json({
                status: true,
                message: 'Funds added successfully',
                data: {
                    newBalance: user.balance,
                    transaction: {
                        id: transaction._id,
                        amount: transaction.amount,
                        type: transaction.type,
                        status: transaction.status,
                        description: transaction.description,
                        createdAt: transaction.created_at
                    },
                    fund: {
                        id: fund._id,
                        amount: fund.amount,
                        status: fund.status,
                        description: fund.description,
                        createdAt: fund.created_at
                    }
                }
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error: unknown) {
        console.error('Add Fund Error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message }, { status: 400 });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to add funds';
        return NextResponse.json({ status: false, message: errorMessage });
    }
}




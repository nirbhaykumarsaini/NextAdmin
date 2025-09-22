import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Fund from '@/models/Fund';
import mongoose from 'mongoose';

interface StatusRequest {
    status: 'approved' | 'rejected' | 'pending';
    description?: string;
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ fund_id: string }> }
) {
    try {
        await dbConnect();

        const { fund_id } = await params;

        if (!mongoose.Types.ObjectId.isValid(fund_id)) {
            throw new ApiError('Invalid fund ID');
        }

        const body: StatusRequest = await request.json();
        const { status, description } = body;

        if (!['approved', 'rejected'].includes(status)) {
            throw new ApiError('Invalid status. Must be approved or rejected.');
        }

        // Populate the transaction_id to access the original transaction
        const fund = await Fund.findById(fund_id).populate('transaction_id');
        if (!fund) {
            throw new ApiError('Fund not found');
        }

        if (fund.status !== 'pending') {
            throw new ApiError('Fund already processed');
        }

        const user = await AppUser.findById({ _id: fund.user_id });
        if (!user) {
            throw new ApiError('User not found for this fund');
        }

        try {
            // Find the original transaction
            const originalTransaction = await Transaction.findById(fund.transaction_id);
            if (!originalTransaction) {
                throw new ApiError('Original transaction not found');
            }

            if (status === 'approved') {
                // ✅ Mark fund as approved
                const currentBalance = Number(user.balance) || 0;
                user.balance = currentBalance + fund.amount;
                await user.save();

                fund.status = 'approved';
                fund.description = description || 'Fund approved by Admin';
                await fund.save();

                // ✅ Update the original transaction status to 'completed'
                originalTransaction.status = 'completed';
                originalTransaction.description = description || 'Fund approved by Admin';
                await originalTransaction.save();

            } else if (status === 'rejected') {

                // ✅ Mark fund as rejected
                fund.status = 'rejected';
                fund.description = description || 'Fund rejected by Admin';
                await fund.save();

                // ✅ Update the original transaction status to 'failed'
                originalTransaction.status = 'failed';
                originalTransaction.description = description || 'Fund rejected by Admin';
                await originalTransaction.save();
            }

            return NextResponse.json({
                status: true,
                message: `Fund ${status} successfully`
            });

        } catch (err) {
            throw err;
        }

    } catch (error: unknown) {
        console.error('Fund Status Update Error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message });
        }

        const errorMessage =
            error instanceof Error ? error.message : 'Failed to update fund status';
        return NextResponse.json({ status: false, message: errorMessage });
    }
}
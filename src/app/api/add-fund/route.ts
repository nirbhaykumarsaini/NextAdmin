import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError'; // Fixed typo: APiError -> ApiError
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Fund from '@/models/Fund';
import mongoose from 'mongoose';
import { getUserIdFromToken } from '@/middleware/authMiddleware';
import AccountSetting from '@/models/AccountSettings';
import { validateBidEligibility } from '@/middleware/bidValidationMiddleware';

interface AddFundRequest {
    amount: number;
    description?: string;
    fund_type: 'phonepay' | 'googlepay' | 'paytmpay' | 'airtal' | 'navi' | 'sbi' | 'whatsapp' | 'idfcbank';
    transactionId: string;
    status: 'pending' | 'completed' | 'failed';
}

export async function POST(request: NextRequest) { // Changed to NextRequest
    try {
        await dbConnect();

        // Extract user_id from token
        const user_id = getUserIdFromToken(request);

        if (!user_id) {
            throw new ApiError('Unauthorized - Invalid or missing token');
        }

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new ApiError('Invalid user ID from token');

        }

        const eligibilityCheck = await validateBidEligibility(user_id);
        if (!eligibilityCheck.isValid) {
            throw new ApiError(eligibilityCheck.error || 'User not eligible for add fund');
        }

        const body: Omit<AddFundRequest, 'user_id'> = await request.json(); // Remove user_id from body
        const { amount, fund_type, description, transactionId, status } = body;

        if (!['phonepay', 'googlepay', 'paytmpay', 'airtal', 'navi', 'sbi', 'whatsapp', 'idfcbank'].includes(fund_type)) {
            throw new ApiError(`Invalid fund_type`);
        }

        const accountSetting = await AccountSetting.findOne();

        if (!accountSetting) throw new ApiError('Invalid user ID from token');


        if (!amount || amount <= accountSetting.min_deposit) throw new ApiError(`Amount must be greater than ${accountSetting.min_deposit}`);
        if (amount > accountSetting.max_deposit) throw new ApiError(`Amount cannot exceed ₹${accountSetting.max_deposit}`);

        if (!status) throw new ApiError('Payment status is required');
        if (!['pending', 'completed', 'failed'].includes(status))
            throw new ApiError('Invalid payment status');

        const user = await AppUser.findById(user_id);
        if (!user) throw new ApiError('User not found');
        if (user.is_blocked) throw new ApiError('Cannot add funds to blocked user');

        // Save Transaction
        const transaction = new Transaction({
            user_id: user._id,
            amount,
            type: 'credit',
            status: status === 'completed' ? 'completed' : 'failed',
            description: description || `Funds added by ${user.name}`
        });
        await transaction.save();

        // Save Fund record
        const fund = new Fund({
            user_id: user._id,
            transaction_id: transaction._id,
            amount,
            fund_type,
            status: status === 'completed' ? 'completed' : 'failed',
            description: description || `Funds added by ${user.name} via ${fund_type}`,
            transactionId
        });
        await fund.save();

        if (status === 'completed') {
            const currentBalance = Number(user.balance) || 0;
            const addedAmount = Number(amount) || 0;
            user.balance = currentBalance + addedAmount;
            await user.save();
        }

        return NextResponse.json({
            status: true,
            message: status === 'completed' ? 'Funds added successfully' : 'Payment failed',
        });
    } catch (error: unknown) {
        console.error('Add Fund Error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json(
                { status: false, message: error.message }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to add funds';
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}
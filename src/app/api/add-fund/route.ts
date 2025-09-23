import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError'; // Fixed typo: APiError -> ApiError
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Fund from '@/models/Fund';
import mongoose from 'mongoose';
import { getUserIdFromToken } from '@/middleware/authMiddleware';

interface AddFundRequest {
    amount: number;
    description?: string;
    fund_type: 'phonepay' | 'googlepay' | 'paytmpay';
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

        const body: Omit<AddFundRequest, 'user_id'> = await request.json(); // Remove user_id from body
        const { amount, fund_type, description } = body;

        if (!['phonepay', 'googlepay', 'paytmpay'].includes(fund_type)) {
            throw new ApiError(`Invalid fund_type`);
        }

        if (!amount || amount <= 0) throw new ApiError('Amount must be greater than 0');
        if (amount > 100000) throw new ApiError('Amount cannot exceed ₹100,000');

        const user = await AppUser.findById(user_id);
        if (!user) throw new ApiError('User not found');
        if (user.is_blocked) throw new ApiError('Cannot add funds to blocked user');

        // Save Transaction
        const transaction = new Transaction({
            user_id: user._id,
            amount,
            type: 'credit',
            status: 'pending',
            description: description || `Funds added by ${user.name}`
        });
        await transaction.save();

        // Save Fund record
        const fund = new Fund({
            user_id: user._id,
            transaction_id: transaction._id,
            amount,
            fund_type,
            status: 'pending',
            description: description || `Funds added by ${user.name} via ${fund_type}`
        });
        await fund.save();

        return NextResponse.json({
            status: true,
            message: 'Funds added successfully',
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
            { status: false, message: errorMessage }        );
    }
}
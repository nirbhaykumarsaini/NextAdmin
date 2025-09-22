import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError'; // Fixed typo: APiError → ApiError
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Withdrawal from '@/models/Withdrawal';
import AccountSetting from '@/models/AccountSettings';
import mongoose, { Types } from 'mongoose';
import WithdrawalMethod from '@/models/WithdrawalMethod';

interface WithdrawRequest {
    amount: number;
    description?: string;
    user_id: Types.ObjectId;
    withdrawal_method_id: Types.ObjectId; // Added withdrawal method ID
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body: WithdrawRequest = await request.json();
        const { user_id, amount, withdrawal_method_id, description } = body;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new ApiError('Invalid user ID');
        }

        if (!mongoose.Types.ObjectId.isValid(withdrawal_method_id)) {
            throw new ApiError('Invalid withdrawal method ID');
        }

        // ✅ Validate amount
        if (!amount || amount <= 0) {
            throw new ApiError('Amount must be greater than 0');
        }

        // ✅ Fetch account settings
        const accountSettings = await AccountSetting.findOne({});
        if (!accountSettings) {
            throw new ApiError('Withdrawal settings not configured');
        }

        // ✅ Check withdrawal time window
        const now = new Date();
        const [openHour, openMinute] = (accountSettings.withdrawal_open_time || '00:00').split(':').map(Number);
        const [closeHour, closeMinute] = (accountSettings.withdrawal_close_time || '23:59').split(':').map(Number);

        const openTime = new Date(now);
        openTime.setHours(openHour, openMinute, 0, 0);

        const closeTime = new Date(now);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        if (now < openTime || now > closeTime) {
            throw new ApiError(`Withdrawals are allowed only between ${accountSettings.withdrawal_open_time} and ${accountSettings.withdrawal_close_time}`);
        }

        // ✅ Find user
        const user = await AppUser.findById(user_id);
        if (!user) {
            throw new ApiError('User not found');
        }

        if (user.is_blocked) {
            throw new ApiError('Cannot withdraw funds from blocked user');
        }

        // ✅ Find and validate withdrawal method
        const withdrawalMethod = await WithdrawalMethod.findOne({
            _id: withdrawal_method_id,
            user_id: user_id
        });

        if (!withdrawalMethod) {
            throw new ApiError('Withdrawal method not found or does not belong to user');
        }

        // ✅ Check min/max withdrawal limits
        if (amount < accountSettings.min_withdrawal || amount > accountSettings.max_withdrawal) {
            throw new ApiError(`Withdrawal amount must be between ${accountSettings.min_withdrawal} and ${accountSettings.max_withdrawal}`);
        }

        // ✅ Check sufficient balance
        if (user.balance < amount) {
            throw new ApiError('Insufficient balance');
        }

        try {
            // Update user balance
            user.balance -= amount;
            await user.save();

            // Create transaction record
            const transaction = new Transaction({
                user_id: user._id,
                amount,
                type: 'debit',
                status: 'pending',
                description: description || `Withdrawal request submitted by ${user.name}`,
            });
            await transaction.save();

            // ✅ Create withdrawal record with withdrawal method
            const withdrawal = new Withdrawal({
                user_id: user._id,
                withdrawal_method_id: withdrawal_method_id,
                transaction_id: transaction._id,
                amount,
                status: 'pending',
                description: description || `Withdrawal request submitted by ${user.name}`,
            });
            await withdrawal.save();

            return NextResponse.json({
                status: true,
                message: 'Withdrawal request submitted successfully'
            });
        } catch (error) {
            throw error;
        }
    } catch (error: unknown) {
        console.error('Withdraw Error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message });
        }

        const errorMessage =
            error instanceof Error ? error.message : 'Failed to process withdrawal';
        return NextResponse.json({ status: false, message: errorMessage });
    }
}
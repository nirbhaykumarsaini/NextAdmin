import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Withdrawal from '@/models/Withdrawal';
import AccountSetting from '@/models/AccountSettings';
import mongoose from 'mongoose';

interface WithdrawRequest {
  amount: number;
  description?: string;
}



export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid user ID');
    }

    const body: WithdrawRequest = await request.json();
    const { amount, description } = body;

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
    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
    }

    if (user.is_blocked) {
      throw new ApiError('Cannot withdraw funds from blocked user');
    }

    // ✅ Check min/max withdrawal limits
    if (amount < accountSettings.min_withdrawal || amount > accountSettings.max_withdrawal) {
      throw new ApiError(`Withdrawal amount must be between ${accountSettings.min_withdrawal} and ${accountSettings.max_withdrawal}`);
    }

    // ✅ Check sufficient balance
    if (user.balance < amount) {
      throw new ApiError('Insufficient balance');
    }

    // ✅ Start transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user balance
      user.balance -= amount;
      await user.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        user_id: user._id,
        amount,
        type: 'debit',
        status: 'completed',
        description: description || `Funds withdrawn`,
      });
      await transaction.save({ session });

      // ✅ Create withdrawal record
      const withdrawal = new Withdrawal({
        user_id: user._id,
        amount,
        status: 'pending', // Admin may later mark completed
        description,
      });
      await withdrawal.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        status: true,
        message: 'Withdrawal request submitted successfully',
        data: {
          newBalance: user.balance,
          transaction: {
            id: transaction._id,
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.created_at
          }
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid user ID');
    }

    // ✅ Check user exists
    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
    }

    // ✅ Fetch withdrawals of user
    const withdrawals = await Withdrawal.find({ user_id: id })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    return NextResponse.json({
      status: true,
      data: withdrawals,
    });
  } catch (error: unknown) {
    console.error('Withdrawal GET Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch withdrawals';
    return NextResponse.json({ status: false, message: errorMessage });
  }
}


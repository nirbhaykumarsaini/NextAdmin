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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [withdrawals, totalCount] = await Promise.all([
      Withdrawal.find({ user_id: id })
        .populate('user_id', 'name mobile_number')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments({ user_id: id })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      status: true,
      message: 'Withdrawals fetched successfully',
      data: {
        withdrawals,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error: unknown) {
    console.error('Get Withdrawals Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch withdrawals';
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
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

    // ✅ Find user
    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
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
        status: 'approved',
        description:description || `Withdrawal by Admin`,
      });
      await transaction.save();

      // ✅ Create withdrawal record
      const withdrawal = new Withdrawal({
        user_id: user._id,
        amount,
        status: 'approved', // Admin may later mark approved
        description: description || "Withdrawal by Admin",
      });
      await withdrawal.save();

      return NextResponse.json({
        status: true,
        message: 'Withdrawal successfully',
      });
    } catch (error) {

      throw error;
    }
  } catch (error: unknown) {
    console.error('Withdraw Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal';
    return NextResponse.json({ status: false, message: errorMessage });
  }
}



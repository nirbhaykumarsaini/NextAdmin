import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Withdrawal from '@/models/Withdrawal';
import mongoose from 'mongoose';


interface StatusRequest {
  status: 'completed' | 'failed' | 'pending';
  description?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ withdrawalId: string }> }
) {
  try {
    await dbConnect();

    const { withdrawalId } = await params;

    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      throw new ApiError('Invalid withdrawal ID');
    }

    const body: StatusRequest = await request.json();
    const { status, description } = body;

    if (!['completed', 'failed'].includes(status)) {
      throw new ApiError('Invalid status. Must be completed or failed.');
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new ApiError('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new ApiError('Withdrawal already processed');
    }

    const user = await AppUser.findById({_id:withdrawal.user_id});
    if (!user) {
      throw new ApiError('User not found for this withdrawal');
    }

    // ✅ Start DB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (status === 'completed') {
        // ✅ Mark as completed only
        withdrawal.status = 'completed';
        withdrawal.description = description || withdrawal.description;
        await withdrawal.save({ session });

        // Create transaction log
        const txn = new Transaction({
          user_id: user._id,
          amount: withdrawal.amount,
          type: 'debit',
          status: 'completed',
          description: description || 'Withdrawal approved',
        });
        await txn.save({ session });

      } else if (status === 'failed') {
        // ✅ Refund user
        user.balance += withdrawal.amount;
        await user.save({ session });

        withdrawal.status = 'failed';
        withdrawal.description = description || 'Withdrawal rejected';
        await withdrawal.save({ session });

        // Create refund transaction
        const txn = new Transaction({
          user_id: user._id,
          amount: withdrawal.amount,
          type: 'credit',
          status: 'completed',
          description: description || 'Withdrawal rejected, amount refunded',
        });
        await txn.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        status: true,
        message: `Withdrawal ${status} successfully`,
        data: withdrawal,
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

  } catch (error: unknown) {
    console.error('Withdrawal Status Update Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update withdrawal status';
    return NextResponse.json({ status: false, message: errorMessage });
  }
}

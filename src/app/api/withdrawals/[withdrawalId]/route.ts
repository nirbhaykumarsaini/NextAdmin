import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Withdrawal from '@/models/Withdrawal';
import mongoose from 'mongoose';


interface StatusRequest {
  status: 'approved' | 'rejected' | 'pending';
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

    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError('Invalid status. Must be approved or rejected.');
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

    try {
      if (status === 'approved') {
        // ✅ Mark as approved only
        withdrawal.status = 'approved';
        withdrawal.description = description || 'Withdrawal approved by Admin';
        await withdrawal.save();

        // Create transaction log
        const txn = new Transaction({
          user_id: user._id,
          amount: withdrawal.amount,
          type: 'debit',
          status: 'rejected',
          description: description || 'Withdrawal approved by Admin',
        });
        await txn.save();

      } else if (status === 'rejected') {
        // ✅ Refund user
        user.balance += withdrawal.amount;
        await user.save();

        withdrawal.status = 'rejected';
        withdrawal.description = description || 'Withdrawal rejected by Admin';
        await withdrawal.save();

        // Create refund transaction
        const txn = new Transaction({
          user_id: user._id,
          amount: withdrawal.amount,
          type: 'credit',
          status: 'failed',
          description: description || 'Withdrawal rejected by Admin',
        });
        await txn.save();
      }

      return NextResponse.json({
        status: true,
        message: `Withdrawal ${status} successfully`,
        data: withdrawal,
      });

    } catch (err) {
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

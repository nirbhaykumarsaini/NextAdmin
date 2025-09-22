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

    // Populate the transaction_id to access the original transaction
    const withdrawal = await Withdrawal.findById(withdrawalId).populate('transaction_id');
    if (!withdrawal) {
      throw new ApiError('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new ApiError('Withdrawal already processed');
    }

    const user = await AppUser.findById({_id: withdrawal.user_id});
    if (!user) {
      throw new ApiError('User not found for this withdrawal');
    }

    try {
      // Find the original transaction
      const originalTransaction = await Transaction.findById(withdrawal.transaction_id);
      if (!originalTransaction) {
        throw new ApiError('Original transaction not found');
      }

      if (status === 'approved') {
        // ✅ Mark withdrawal as approved
        withdrawal.status = 'approved';
        withdrawal.description = description || 'Withdrawal approved by Admin';
        await withdrawal.save();

        // ✅ Update the original transaction status to 'completed'
        originalTransaction.status = 'completed';
        originalTransaction.description = description || 'Withdrawal approved by Admin';
        await originalTransaction.save();

      } else if (status === 'rejected') {
        // ✅ Refund user
        user.balance += withdrawal.amount;
        await user.save();

        // ✅ Mark withdrawal as rejected
        withdrawal.status = 'rejected';
        withdrawal.description = description || 'Withdrawal rejected by Admin';
        await withdrawal.save();

        // ✅ Update the original transaction status to 'failed'
        originalTransaction.status = 'failed';
        originalTransaction.description = description || 'Withdrawal rejected by Admin';
        await originalTransaction.save();
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
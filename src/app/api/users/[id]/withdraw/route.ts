import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
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

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ApiError('Amount must be greater than 0');
    }

    // Find user
    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
    }

    if (user.is_blocked) {
      throw new ApiError('Cannot withdraw funds from blocked user');
    }

    // Check sufficient balance
    if (user.balance < amount) {
      throw new ApiError('Insufficient balance');
    }

    // Start transaction session for atomic operations
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
        description: description || `Funds withdrawn by admin`
      });

      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        status: true,
        message: 'Funds withdrawn successfully',
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
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error: unknown) {
    console.error('Withdraw Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw funds';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
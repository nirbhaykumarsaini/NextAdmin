import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

interface AddFundRequest {
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

    const body: AddFundRequest = await request.json();
    const { amount, description } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ApiError('Amount must be greater than 0');
    }

    if (amount > 100000) { // Optional: Set maximum limit
      throw new ApiError('Amount cannot exceed ₹100,000');
    }

    // Find user
    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
    }

    if (user.is_blocked) {
      throw new ApiError('Cannot add funds to blocked user');
    }

    // Start transaction session for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user balance
      user.balance += amount;
      await user.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        user_id: user._id,
        amount,
        type: 'credit',
        status: 'completed',
        description: description || `Funds added by admin`
      });

      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        status: true,
        message: 'Funds added successfully',
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
    console.error('Add Fund Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to add funds';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
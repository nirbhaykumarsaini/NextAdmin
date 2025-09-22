import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Fund from '@/models/Fund';
import mongoose from 'mongoose';

interface AddFundRequest {
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
      throw new ApiError('Invalid user ID', 400);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [funds, totalCount] = await Promise.all([
      Fund.find({ user_id: id })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Fund.countDocuments({ user_id: id })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      status: true,
      message: 'Funds fetched successfully',
      data: {
        funds,
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
    console.error('Get Funds Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: error.statusCode }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch funds';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
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

    const body: AddFundRequest = await request.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) throw new ApiError('Amount must be greater than 0');
    if (amount > 100000) throw new ApiError('Amount cannot exceed ₹100,000');

    const user = await AppUser.findById(id);
    if (!user) throw new ApiError('User not found');
    if (user.is_blocked) throw new ApiError('Cannot add funds to blocked user');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user balance
      user.balance += amount;
      await user.save({ session });

      // Save Transaction
      const transaction = new Transaction({
        user_id: user._id,
        amount,
        type: 'credit',
        status: 'completed',
        description: description || `Funds added by Admin`
      });
      await transaction.save({ session });

      // Save Fund record
      const fund = new Fund({
        user_id: user._id,
        amount,
        status: 'approved',
        description: description || 'Funds added by Admin'
      });
      await fund.save({ session });

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        status: true,
        message: 'Funds added successfully',
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: unknown) {
    console.error('Add Fund Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to add funds';
    return NextResponse.json({ status: false, message: errorMessage }, { status: 500 });
  }
}




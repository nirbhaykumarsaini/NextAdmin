import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

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
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { user_id: id, status: 'completed' };
    if (type && ['credit', 'debit'].includes(type)) {
      filter.type = type;
    }

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      status: true,
      message: 'User transactions fetched successfully',
      data: {
        transactions: transactions.map(transaction => ({
          id: transaction._id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.created_at
        })),
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
    console.error('Get User Transactions Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user transactions';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

interface GetTransactionsParams {
    user_id:string;
    type?: string;
    status?: string;
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: GetTransactionsParams = { user_id: id };
    if (type && ['credit', 'debit'].includes(type)) {
      filter.type = type;
    }
    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      filter.status = status;
    }

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      status: true,
      message: 'Transactions fetched successfully',
      data: {
        transactions,
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
    console.error('Get Transactions Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: error.statusCode }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
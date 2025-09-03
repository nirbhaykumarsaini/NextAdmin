import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Build filter object
    const filter: any = { };
    
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user_id = new mongoose.Types.ObjectId(userId);
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate('user_id', 'name mobile_number')
        .sort({ created_at: -1 }),
      Transaction.countDocuments(filter)
    ]);

    return NextResponse.json({
      status: true,
      message: 'Transactions fetched successfully',
      data: {
        transactions: transactions.map(transaction => ({
          id: transaction._id.toString(),
          userId: transaction.user_id?._id.toString(),
          userName: transaction.user_id?.name,
          userMobile: transaction.user_id?.mobile_number,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.created_at,
          formattedTime: formatTimeAgo(transaction.created_at)
        })),
       
      }
    });

  } catch (error: unknown) {
    console.error('Transactions API Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';

    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
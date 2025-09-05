import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Fund from '@/models/Fund';
import mongoose from 'mongoose';



export async function POST(
  request: Request
) {
  try {
    await dbConnect();
      const body = await request.json();
        const { user_id } = body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError('Invalid user ID');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [funds, totalCount] = await Promise.all([
      Fund.find({ user_id: user_id })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Fund.countDocuments({ user_id: user_id })
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
      { status: false, message: errorMessage }
    );
  }
}






import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Parse body
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      throw new ApiError('User ID is required');
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError('Invalid user ID');
    }

    const user = await AppUser.findById(user_id);
    if (!user) {
      throw new ApiError('User not found');
    }

    return NextResponse.json({
      status: true,
      data: {
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number,
        is_verified: user.is_verified,
        batting: user.batting,
        balance: user.balance,
      },
    });

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

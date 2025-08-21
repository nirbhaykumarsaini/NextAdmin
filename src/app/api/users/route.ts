import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import User from '@/models/User';
import connectDB from '@/config/db';

// Connect to database
connectDB();

export async function GET(request: NextRequest) {
  try {
    await authenticate(request);

    const users = await User.find().select('-password');
    return NextResponse.json({ status: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message },
    );
  }
}


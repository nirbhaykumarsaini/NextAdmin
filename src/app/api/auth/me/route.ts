import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// Ensure DB is connected
await connectDB();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Not authenticated' }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token) as { sub: string };

    if (!decoded?.sub) {
      return NextResponse.json(
        { status: false, message: 'Invalid token' });
    }

    // Fetch user without password
    const user = await User.findById(decoded.sub).select('-password');

    if (!user) {
      return NextResponse.json(
        { status: false, message: 'User not found' });
    }


    return NextResponse.json({
      status: true,
      user: {
        _id: user._id,
        username: user.username,
        password:user.plain_password,
        role: user.role
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user details'
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}

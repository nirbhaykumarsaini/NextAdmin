import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';
import Role from '@/models/Role';

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

    // Fetch role with only needed fields (excluding users, createdAt, updatedAt, __v)
    const roleWithPermissions = await Role.findOne({ role_name: user.role })
      .select('permissions') // keep only what you want
      .populate('permissions', 'permission_name permission_key');

    return NextResponse.json({
      status: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        permissions: roleWithPermissions?.permissions ? roleWithPermissions?.permissions : [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

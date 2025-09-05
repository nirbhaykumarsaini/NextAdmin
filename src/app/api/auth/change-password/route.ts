import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// Ensure DB is connected
await connectDB();

export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { status: false, message: 'Not authenticated' });
        }

        // Verify JWT token
        const decoded = verifyToken(token) as { sub: string };

        if (!decoded?.sub) {
            return NextResponse.json(
                { status: false, message: 'Invalid token' });
        }

        // Parse request body
        const { old_password, new_password, confirm_password } = await request.json();

        // Validate required fields
        if (!old_password || !new_password || !confirm_password) {
            return NextResponse.json(
                { status: false, message: 'All fields are required' });
        }

        // Check if new password matches confirmation
        if (new_password !== confirm_password) {
            return NextResponse.json(
                { status: false, message: 'New password and confirm password do not match' });
        }

        // Check if new password is different from old password
        if (old_password === new_password) {
            return NextResponse.json(
                { status: false, message: 'New password must be different from old password' }
            );
        }

        // Fetch user with password (we need it for comparison)
        const user = await User.findById(decoded.sub).select('+password');

        if (!user) {
            return NextResponse.json(
                { status: false, message: 'User not found' });
        }

        // Verify old password
        const isOldPasswordValid = await user.comparePassword(old_password);
        if (!isOldPasswordValid) {
            return NextResponse.json(
                { status: false, message: 'Current password is incorrect' });
        }

        // Update password
        user.password = new_password;
        await user.save();

        return NextResponse.json({
            status: true,
            message: 'Password updated successfully',
        });

    } catch (error: unknown) {
        console.error('Error changing password:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import AppUser from '@/models/AppUser';
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
        const {
            new_password,
            new_m_pin,
            type = 'password' // 'password' or 'mpin'
        } = await request.json();

        // Validate type
        if (!['password', 'mpin'].includes(type)) {
            return NextResponse.json(
                { status: false, message: 'Type must be either "password" or "mpin"' });
        }

        // Fetch user
        const user = await AppUser.findById(decoded.sub).select('+password');
        if (!user) {
            return NextResponse.json(
                { status: false, message: 'User not found' });
        }

        if (type === 'password') {

            // Check if new password is same as current password
            const isSamePassword = await user.comparePassword(new_password);
            if (isSamePassword) {
                return NextResponse.json(
                    { status: false, message: 'New password cannot be the same as current password' });
            }

            // Update password
            user.password = new_password;
            await user.save();

            return NextResponse.json({
                status: true,
                message: 'Password updated successfully',
            });

        } else if (type === 'mpin') {

            // Check if new M-PIN is same as current M-PIN
            if (parseInt(new_m_pin) === user.m_pin) {
                return NextResponse.json(
                    { status: false, message: 'New M-PIN cannot be the same as current M-PIN' });
            }

            // Validate M-PIN format (4 digits)
            const mPinRegex = /^\d{4}$/;
            if (!mPinRegex.test(new_m_pin)) {
                return NextResponse.json(
                    { status: false, message: 'M-PIN must be exactly 4 digits' });
            }

            // Update M-PIN
            user.m_pin = parseInt(new_m_pin);
            await user.save();

            return NextResponse.json({
                status: true,
                message: 'M-PIN updated successfully',
            });
        }

    } catch (error: unknown) {
        console.error('Error changing password/mpin:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to change password/mpin';
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}
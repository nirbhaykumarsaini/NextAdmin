import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError'; // Fixed typo: APiError -> ApiError

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Validation
        if (!body.mobile_number) {
            throw new ApiError('Mobile number is required');
        }

        const user = await AppUser.findOne({
            mobile_number: body.mobile_number.trim()
        }).select('name mobile_number is_verified is_blocked batting balance created_at devices');

        if (!user) {
            return NextResponse.json({ status: false, message: 'No account found with this mobile number', exists: false });
        }

        if (user.is_blocked) {
            return NextResponse.json({ status: false, message: 'Your account has been blocked. Please contact support.' });
        }

        if (!user.is_verified) {
            return NextResponse.json({ status: false, message: 'Your account is not verified. Please verify your account.', });
        }

        if (!user.batting) {
            return NextResponse.json({ status: false, message: 'Your account is currently in batting mode. Please try again later.' });
        }

        return NextResponse.json({ status: true, message: 'User account exists', exists: true, });

    } catch (error: unknown) {

        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message, exists: false });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to check user';

        return NextResponse.json({ status: false, message: errorMessage, exists: false });
    }
}
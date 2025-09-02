import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    if (!body.mobile_number || !body.newPassword) {
      const missingFields = [];
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.newPassword) missingFields.push('newPassword');

      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (!user) {
      throw new ApiError('User not found');
    }

    // Update password
    user.password = body.newPassword;
    user.otp = ''; // Clear OTP after successful reset
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'Password reset successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reset passwod'
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}
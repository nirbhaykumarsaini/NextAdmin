import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import { generateOtp, sendOtp } from '@/services/otpService';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    if (!body.mobile_number) {
      throw new ApiError('mobile_number is required');
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (!user) {
      // For security reasons, don't reveal if user exists or not
      return NextResponse.json({
        status: true,
        message: 'If the mobile number is registered, you will receive an OTP'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json({
        status: true,
        message: 'Your account is already verified. You can proceed to login.'
      });
    }

    const otp = generateOtp();

    const smsResponse = await sendOtp(body.mobile_number, otp);

    if (!smsResponse?.success) {
      throw new ApiError("Failed to send OTP SMS: " + smsResponse?.error);
    }

    user.otp = otp;
    await user.save();

    // For now, we'll just return it in the response for testing
    return NextResponse.json({
      status: true,
      message: 'OTP sent successfully',
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send resent otp'
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: errorMessage }
      );
    }

  }
}
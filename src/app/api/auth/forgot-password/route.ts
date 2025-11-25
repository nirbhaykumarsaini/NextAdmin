

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

    const otp = generateOtp();

    const smsResponse = await sendOtp(body.mobile_number, otp);

    if (!smsResponse.success) {
      throw new ApiError("Failed to send OTP SMS: " + smsResponse.error);
    }

    user.otp = otp;
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'If the mobile number is registered, you will receive an OTP'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to forget password'
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}
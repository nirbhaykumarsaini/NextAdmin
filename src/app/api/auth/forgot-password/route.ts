

import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';

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

    // Generate and save OTP (using dummy OTP 1234)
    user.otp = '123456';
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'If the mobile number is registered, you will receive an OTP',
      otp: '123456' // Only for development
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to forget password'
      return NextResponse.json(
        { status: false, message: errorMessage }
      );
  }
}
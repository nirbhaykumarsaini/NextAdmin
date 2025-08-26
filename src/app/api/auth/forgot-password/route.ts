import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import logger from '@/config/logger';

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
    user.otp = '1234';
    await user.save();

    // In a real app, you would send the OTP via SMS here
    // For now, we'll just return it in the response for testing
    return NextResponse.json({
      status: true,
      message: 'If the mobile number is registered, you will receive an OTP',
      otp: '1234' // Only for development
    });

  } catch (error: any) {
    logger.error(error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Internal server error' }
    );
  }
}
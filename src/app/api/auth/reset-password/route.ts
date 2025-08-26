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
    if (!body.mobile_number || !body.otp || !body.newPassword) {
      const missingFields = [];
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.otp) missingFields.push('otp');
      if (!body.newPassword) missingFields.push('newPassword');
      
      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`,
        400
      );
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (!user) {
      throw new ApiError('User not found');
    }

    // Verify OTP (using dummy OTP 1234)
    if (body.otp !== '1234') {
      throw new ApiError('Invalid OTP');
    }

    // Update password
    user.password = body.newPassword;
    user.otp = ''; // Clear OTP after successful reset
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'Password reset successfully'
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
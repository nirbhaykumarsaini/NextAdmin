import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import { generateToken } from '@/lib/auth/jwt';
import ApiError from '@/lib/errors/APiError';
import logger from '@/config/logger';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    if (!body.mobile_number || !body.otp) {
      const missingFields = [];
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.otp) missingFields.push('otp');
      
      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (!user) {
      throw new ApiError('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      throw new ApiError('User is already verified');
    }

    // Verify OTP (using dummy OTP 1234)
    if (body.otp !== '1234') {
      throw new ApiError('Invalid OTP');
    }

    // Update user as verified
    user.isVerified = true;
    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      mobile_number: user.mobile_number
    });

    return NextResponse.json({
      status: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number
      }
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
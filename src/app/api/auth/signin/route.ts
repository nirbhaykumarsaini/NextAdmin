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
    if (!body.mobile_number || !body.password) {
      const missingFields = [];
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.password) missingFields.push('password');
      
      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`
      );
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (!user) {
      throw new ApiError('Invalid mobile number or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(body.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid mobile number or password');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new ApiError('Please verify your account with OTP first');
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      mobile_number: user.mobile_number
    });

    return NextResponse.json({
      status: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number
      }
    });

  } catch (error: unknown) {
    logger.error(error);
    const errorMessage = error instanceof Error ? error.message :  'Failed to signin user'
      return NextResponse.json(
        { status: false, message: errorMessage }
      );
  }
}
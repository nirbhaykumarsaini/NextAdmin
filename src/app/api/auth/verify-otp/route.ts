import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import { generateToken } from '@/lib/auth/jwt';
import ApiError from '@/lib/errors/APiError';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    if (!body.mobile_number || !body.otp || !body.type) {
      const missingFields = [];
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.otp) missingFields.push('otp');
      if (!body.type) missingFields.push('type');

      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`
      );
    }

    // Validate type
    if (!['signup', 'forgot'].includes(body.type)) {
      throw new ApiError('Invalid type. Must be either "signup" or "forgot"');
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (!user) {
      throw new ApiError('User not found');
    }

    // Handle different types
    if (body.type === 'signup') {
      // For signup: Check if already verified
      if (user.is_verified) {
        throw new ApiError('User is already verified');
      }

      // Verify OTP (using dummy OTP 1234)
      if (body.otp !== '1234') {
        throw new ApiError('Invalid OTP');
      }

      // Update user as verified
      user.is_verified = true;
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

    } else if (body.type === 'forgot') {
      // For forgot password: Only verify OTP without marking user as verified
      // Verify OTP (using dummy OTP 1234)
      if (body.otp !== '1234') {
        throw new ApiError('Invalid OTP');
      }

      // Generate token (might want to set shorter expiration for reset tokens)
      const token = generateToken({
        id: user._id.toString()
      });

      return NextResponse.json({
        status: true,
        message: 'OTP verified successfully. You can now reset your password.',
        forgot: true
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: errorMessage }
      );
    }

    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}
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
    const validTypes = ['signup', 'forgot', 'forgot-mpin'];
    if (!validTypes.includes(body.type)) {
      throw new ApiError('Invalid type. Must be "signup", "forgot", or "forgot-mpin"');
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: body.mobile_number.trim() });
    if (!user) {
      throw new ApiError('User not found');
    }

    if (!user.otp) {
      throw new ApiError("OTP not generated for this user");
    }

    if (body.otp !== user.otp) {
      throw new ApiError("Invalid OTP");
    }

    // Handle different types
    if (body.type === 'signup') {
      // For signup: Check if already verified
      if (user.is_verified) {
        throw new ApiError('User is already verified');
      }

      // Update user as verified
      user.is_verified = true;
      user.otp = null;
      await user.save();

      // Generate token
      const token = generateToken({
        id: user._id.toString(),
        mobile_number: user.mobile_number
      });

      return NextResponse.json({
        status: true,
        message: 'OTP verified successfully',
        user: {
          id: user._id,
          name: user.name,
          mobile_number: user.mobile_number,
          token
        }
      });

    } else if (body.type === 'forgot') {

      user.otp = null;
      await user.save();

      return NextResponse.json({
        status: true,
        message: 'OTP verified successfully. You can now reset your password.',
        reset_type: 'password'
      });

    } else if (body.type === 'forgot-mpin') {

      user.otp = null;
      await user.save();

      return NextResponse.json({
        status: true,
        message: 'OTP verified successfully. You can now reset your M-PIN.',
        reset_type: 'mpin'
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
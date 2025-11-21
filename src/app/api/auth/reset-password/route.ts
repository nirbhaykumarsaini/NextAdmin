import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';

interface ResetRequest {
  mobile_number: string;
  newPassword: string;
  newMPin: string;
  type: 'password' | 'mpin';
}

// Validation functions
function validateMobileNumber(mobile: string): boolean {
  const mobileRegex = /^[0-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

function validateMPin(mpin: string): boolean {
  const mPinRegex = /^\d{4}$/;
  return mPinRegex.test(mpin);
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body: ResetRequest = await request.json();

    // Validate type
    if (!body.type || !['password', 'mpin'].includes(body.type)) {
      throw new ApiError('Type must be either "password" or "mpin"');
    }

    // Basic field validation
    if (!body.mobile_number) {
      throw new ApiError('Mobile number is required');
    }

    // Trim and validate mobile number
    const mobileNumber = body.mobile_number.trim();
    if (!validateMobileNumber(mobileNumber)) {
      throw new ApiError('Please enter a valid 10-digit mobile number');
    }

    // Find user
    const user = await AppUser.findOne({ mobile_number: mobileNumber });
    if (!user) {
      throw new ApiError('User not found with this mobile number');
    }

    // Check if user is blocked
    if (user.is_blocked) {
      throw new ApiError('Your account is blocked. Please contact support.');
    }

    if (body.type === 'password') {

      // Check if new password is same as current password
      const isSamePassword = await user.comparePassword(body.newPassword);
      if (isSamePassword) {
        throw new ApiError('New password cannot be the same as your current password');
      }

      // Update password and clear OTP
      user.password = body.newPassword;
      user.otp = '';
      await user.save();

      return NextResponse.json({
        status: true,
        message: 'Password reset successfully'
      });

    } else if (body.type === 'mpin') {

      // Validate M-PIN format
      if (!validateMPin(body.newMPin)) {
        throw new ApiError('M-PIN must be exactly 4 digits');
      }

      const newMPinNumber = parseInt(body.newMPin);

      // Check if new M-PIN is same as current M-PIN
      if (user.m_pin === newMPinNumber) {
        throw new ApiError('New M-PIN cannot be the same as your current M-PIN');
      }

      // Update M-PIN and clear OTP
      user.m_pin = newMPinNumber;
      user.otp = '';
      await user.save();

      return NextResponse.json({
        status: true,
        message: 'M-PIN reset successfully'
      });
    }

  } catch (error: unknown) {
    console.error('Reset error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to reset';
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}
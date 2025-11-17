import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';

interface ResetPasswordRequest {
  mobile_number: string;
  newPassword: string;
  confirmPassword: string;
}

// Validation functions
function validateMobileNumber(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile numbers starting with 6-9
  return mobileRegex.test(mobile);
}


export async function POST(request: Request) {
  try {
    await dbConnect();
    const body: ResetPasswordRequest = await request.json();

    // Basic field validation
    if (!body.mobile_number || !body.newPassword || !body.confirmPassword) {
      const missingFields = [];
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.newPassword) missingFields.push('newPassword');
      if (!body.confirmPassword) missingFields.push('confirmPassword');

      throw new ApiError(
        `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required`
      );
    }

    // Trim and validate mobile number
    const mobileNumber = body.mobile_number.trim();
    if (!validateMobileNumber(mobileNumber)) {
      throw new ApiError('Please enter a valid 10-digit mobile number');
    }

    // Check if passwords match
    if (body.newPassword !== body.confirmPassword) {
      throw new ApiError('New password and confirm password do not match');
    }

    // Check if new password is different from current password
    const user = await AppUser.findOne({ mobile_number: mobileNumber });
    if (!user) {
      throw new ApiError('User not found with this mobile number');
    }

    // Check if user is blocked
    if (user.is_blocked) {
      throw new ApiError('Your account is blocked. Please contact support.');
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword?.(body.newPassword);
    if (isSamePassword) {
      throw new ApiError('New password cannot be the same as your current password');
    }

    // Update password and clear OTP
    user.password = body.newPassword;
    user.otp = ''; // Clear OTP after successful reset
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'Password reset successfully'
    });

  } catch (error: unknown) {
    console.error('Password reset error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}
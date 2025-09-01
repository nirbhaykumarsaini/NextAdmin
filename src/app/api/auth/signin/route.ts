import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import { generateToken } from '@/lib/auth/jwt';
import ApiError from '@/lib/errors/APiError'; // Fixed typo in import
import { headers } from 'next/headers';

// Function to extract device info from request
async function getDeviceInfo() {
  const headersList = await headers();

  return {
    device_id: headersList.get('x-device-id') || 'unknown',
    device_model: headersList.get('x-device-model') || 'Unknown',
    os: headersList.get('x-os') || 'Unknown',
    browser: headersList.get('user-agent') || 'Unknown',
    ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown'
  };
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const deviceInfo = await getDeviceInfo();

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

    // Check if user is blocked
    if (!user.is_blocked) {
      throw new ApiError('Your account has been blocked. Please contact support.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(body.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid mobile number or password');
    }

    // Check if user is verified
    if (!user.is_verified) {
      throw new ApiError('Please verify your account with OTP first');
    }

    // Add device information
    await user.addDevice(deviceInfo);

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
        mobile_number: user.mobile_number,
        balance: user.balance,
        batting: user.batting
      }
    });

  } catch (error: unknown) {
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in user';
    
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}
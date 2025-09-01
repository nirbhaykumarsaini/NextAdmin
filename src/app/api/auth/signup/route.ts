import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
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
    const deviceInfo = getDeviceInfo();

    if (!body.name || !body.mobile_number || !body.password) {
      const missingFields = [];
      if (!body.name) missingFields.push('name');
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.password) missingFields.push('password');

      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
    }

    if (!body.name.trim() || !body.mobile_number.trim() || !body.password.trim()) {
      throw new ApiError('Name, mobile number and password cannot be empty');
    }

    const existingUser = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (existingUser) {
      throw new ApiError('User with this mobile number already exists');
    }

    await AppUser.create({
      name: body.name.trim(),
      mobile_number: body.mobile_number.trim(),
      password: body.password,
      otp: '1234',
      is_verified: false,
      is_blocked: false,
      devices: [deviceInfo]
    });

    return NextResponse.json({
      status: true,
      message: 'User registered successfully. Please verify OTP.',
      otp: '1234' // Only for development
    });

  } catch (error: unknown) {

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    // Handle other Error instances
    if (error instanceof Error) {
      // Check for Mongoose validation errors
      if (error.name === 'ValidationError') {
        const mongooseError = error as { errors?: Record<string, { message: string }> };
        if (mongooseError.errors) {
          const messages = Object.values(mongooseError.errors).map(val => val.message);
          return NextResponse.json(
            { status: false, message: messages.join(', ') }
          );
        }
      }

      // Check for MongoDB duplicate key error
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { status: false, message: 'Mobile number already exists' }
        );
      }

      // Generic error
      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' }
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' }
    );
  }
}
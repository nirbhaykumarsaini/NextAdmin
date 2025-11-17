
// src\app\api\auth\signup\route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import { headers } from 'next/headers';



async function getDeviceInfo() {
  const headersList = await headers();

  // Get IP address from various headers
  const ipAddress = headersList.get('x-forwarded-for') ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    headersList.get('true-client-ip') ||
    'Unknown';

  // Get user agent
  const userAgent = headersList.get('user-agent') || 'Unknown';

  // Extract browser/device info from user agent
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceModel = 'Unknown';

  if (userAgent.includes('Android')) {
    os = 'Android';
    // Extract Android device model from user agent
    const androidMatch = userAgent.match(/Android.*; ([^;)]+)\)/);
    deviceModel = androidMatch ? androidMatch[1] : 'Android Device';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    const iosMatch = userAgent.match(/\(([^;]+);/);
    deviceModel = iosMatch ? iosMatch[1] : 'iOS Device';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('OkHttp')) {
    browser = 'OkHttp';
  }

  return {
    device_id: headersList.get('x-device-id') ||
      headersList.get('device-id') ||
      headersList.get('x-device-uuid') ||
      'unknown',
    device_model: headersList.get('x-device-model') ||
      headersList.get('device-model') ||
      deviceModel,
    os: headersList.get('x-os') ||
      headersList.get('os') ||
      os,
    browser: headersList.get('x-browser') ||
      headersList.get('browser') ||
      browser,
    ip_address: ipAddress
  };
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const deviceInfo = getDeviceInfo();

    if (!body.name || !body.mobile_number || !body.password ||  !body.m_pin) {
      const missingFields = [];
      if (!body.name) missingFields.push('name');
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.password) missingFields.push('password');
      if (!body.m_pin) missingFields.push('m_pin');

      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
    }

    if (!body.name.trim() || !body.mobile_number.trim() || !body.password.trim()) {
      throw new ApiError('Name, mobile number password and m_pin cannot be empty');
    }

    const existingUser = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (existingUser) {
      throw new ApiError('User with this mobile number already exists');
    }

    await AppUser.create({
      name: body.name.trim(),
      mobile_number: body.mobile_number.trim(),
      password: body.password,
      m_pin:body.m_pin,
      otp: '123456',
      is_verified: false,
      is_blocked: false,
      devices: [deviceInfo],
      email: body.email || '',
      date_of_birth: body.date_of_birth || '',
      address: body.address || '',
      occupation: body.occupation || '',
      deviceToken: body.deviceToken || '',
    });

    return NextResponse.json({
      status: true,
      message: 'User registered successfully. Please verify OTP.',
      otp: '123456' // Only for development
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
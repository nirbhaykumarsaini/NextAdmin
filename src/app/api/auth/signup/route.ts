// src/app/api/auth/signup/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import { headers } from 'next/headers';
import { generateOtp, sendOtp } from '@/services/otpService';

async function getDeviceInfo() {
  const headersList = await headers();

  const ipAddress =
    headersList.get('x-forwarded-for') ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    headersList.get('true-client-ip') ||
    'Unknown';

  const userAgent = headersList.get('user-agent') || 'Unknown';

  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceModel = 'Unknown';

  if (userAgent.includes('Android')) {
    os = 'Android';
    const match = userAgent.match(/Android.*; ([^;)]+)\)/);
    deviceModel = match ? match[1] : 'Android Device';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    const match = userAgent.match(/\(([^;]+);/);
    deviceModel = match ? match[1] : 'iOS Device';
  } else if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';

  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('OkHttp')) browser = 'OkHttp';

  return {
    device_id:
      headersList.get('x-device-id') ||
      headersList.get('device-id') ||
      headersList.get('x-device-uuid') ||
      'unknown',
    device_model:
      headersList.get('x-device-model') ||
      headersList.get('device-model') ||
      deviceModel,
    os:
      headersList.get('x-os') ||
      headersList.get('os') ||
      os,
    browser:
      headersList.get('x-browser') ||
      headersList.get('browser') ||
      browser,
    ip_address: ipAddress
  };
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const deviceInfo = await getDeviceInfo(); // FIXED

    // Missing fields
    if (!body.name || !body.mobile_number || !body.password) {
      const missingFields = [];
      if (!body.name) missingFields.push("name");
      if (!body.mobile_number) missingFields.push("mobile_number");
      if (!body.password) missingFields.push("password");

      throw new ApiError(`${missingFields.join(" and ")} ${missingFields.length > 1 ? "are" : "is"} required`);
    }

    // Empty strings
    if (!body.name.trim() || !body.mobile_number.trim() || !body.password.trim()) {
      throw new ApiError("Name, mobile number and password cannot be empty");
    }

    // Check existing user
    const existingUser = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (existingUser) {
      throw new ApiError("User with this mobile number already exists");
    }

    const otp = generateOtp();

    // Send OTP
    const smsResponse = await sendOtp(body.mobile_number, otp);
    console.log("Final SMS Response:", smsResponse);

    if (!smsResponse.success) {
      throw new ApiError("Failed to send OTP SMS: " + smsResponse.error);
    }

    // Create user
    await AppUser.create({
      name: body.name.trim(),
      mobile_number: body.mobile_number.trim(),
      password: body.password,
      simplepassword: body.password,
      otp,
      m_pin: body.m_pin,
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
      message: "User registered successfully. Please verify OTP."
    });

  } catch (error: any) {

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json({ status: false, message: messages.join(", ") });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ status: false, message: "Mobile number already exists" });
    }

    return NextResponse.json({
      status: false,
      message: error.message || "Internal server error"
    });
  }
}

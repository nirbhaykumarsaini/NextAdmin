import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import logger from '@/config/logger';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    if (!body.name || !body.mobile_number || !body.password) {
      const missingFields = [];
      if (!body.name) missingFields.push('name');
      if (!body.mobile_number) missingFields.push('mobile_number');
      if (!body.password) missingFields.push('password');
      
      throw new ApiError(
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required` );
    }

    if (!body.name.trim() || !body.mobile_number.trim() || !body.password.trim()) {
      throw new ApiError('Name, mobile number and password cannot be empty');
    }

    // Check if user already exists
    const existingUser = await AppUser.findOne({ mobile_number: body.mobile_number });
    if (existingUser) {
      throw new ApiError('User with this mobile number already exists');
    }

    // Create user with OTP (using dummy OTP 1234)
    const user = await AppUser.create({
      name: body.name.trim(),
      mobile_number: body.mobile_number.trim(),
      password: body.password,
      otp: '1234', // Default dummy OTP
      isVerifed: false
    });

    // In a real app, you would send the OTP via SMS here
    // For now, we'll just return it in the response for testing
    return NextResponse.json({
      status: true,
      message: 'User registered successfully. Please verify OTP.',
      otp: '1234' // Only for development
    });

  } catch (error: any) {
    logger.error(error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: error.statusCode }
      );
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json(
        { status: false, message: messages.join(', ') }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { status: false, message: 'Mobile number already exists' }
      );
    }
    
    return NextResponse.json(
      { status: false, message: error.message || 'Internal server error' }
    );
  }
}
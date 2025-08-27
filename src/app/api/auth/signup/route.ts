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
        `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
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
    await AppUser.create({
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

  } catch (error: unknown) {
    logger.error(error);

    // Handle ApiError instances
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
  }
}
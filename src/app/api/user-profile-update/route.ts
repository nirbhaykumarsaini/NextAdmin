import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import mongoose from 'mongoose';


const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { user_id, name, email, date_of_birth, address, occupation } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError('Invalid user ID');
    }

    if (email && email.trim() !== '') {
      if (!isValidEmail(email.trim())) {
        throw new ApiError('Please provide a valid email address');
      }
    }

    const user = await AppUser.findById(user_id);
    if (!user) {
      throw new ApiError('User not found');
    }

    user.name = name.trim();

    if (email && email.trim() !== '') {
      user.email = email.trim().toLowerCase();
    }

    // Update other fields if provided
    if (date_of_birth !== undefined) {
      user.date_of_birth = date_of_birth.trim();
    }

    if (address !== undefined) {
      user.address = address.trim();
    }

    if (occupation !== undefined) {
      user.occupation = occupation.trim();
    }

    await user.save();

    return NextResponse.json({
      status: true,
      message: 'User updated successfully'
    });

  } catch (error: unknown) {

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    if (error instanceof Error) {
      // Handle MongoDB duplicate key errors
      if (error.message.includes('duplicate key error')) {
        if (error.message.includes('email')) {
          return NextResponse.json(
            { status: false, message: 'Email already exists' }
          );
        }
      }

      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' }
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' }
    );
  }
}
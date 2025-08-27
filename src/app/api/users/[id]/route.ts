import { NextRequest, NextResponse } from 'next/server';
import ApiError from '@/lib/errors/APiError';
import User from '@/models/User';

import connectDB from '@/config/db';

// Connect to database
connectDB();


export async function GET( { params }: { params: Promise<{ id: string }> }) {
  try {

     const { id } = await params;

    if (!id) {
      throw new ApiError('User ID is required');
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new ApiError('User not found');
    }

    return NextResponse.json({
      status: true,
      data:user,
      message: 'User Fetched successfully'
    });
  } catch (error: unknown) {
     const errorMessage = error instanceof Error ? error.message : "Failed to create user"
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}

export async function PUT(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {

    const {id} = await params;
    const updateData = await request.json();

    if (!id) {
      throw new ApiError('User ID is required');
    }

    // Don't allow password updates through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password');
    
    if (!user) {
      throw new ApiError('User not found');
    }
    
    return NextResponse.json({status: true, data:user});
  } catch (error: unknown) {
     const errorMessage = error instanceof Error ? error.message : "Failed to update user"
    return NextResponse.json(
      { status: false, message:errorMessage },
    );
  }
}

export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  try {

    const {id} = await params;

    if (!id) {
      throw new ApiError('User ID is required');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError( 'User not found');
    }
    
    return NextResponse.json({ 
      status: true, 
      message: 'User deleted successfully' 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}



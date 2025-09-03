import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import mongoose from 'mongoose';


export async function PATCH(request: Request, { params }:{params: Promise<{id:string}>}) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid user ID');
    }

    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
    }

    // Update is_blocked if provided
    if (typeof body.is_blocked === 'boolean') {
      user.is_blocked = body.is_blocked;
    }

    // Update batting if provided
    if (typeof body.batting === 'boolean') {
      user.batting = body.batting;
    }

    await user.save();

    return NextResponse.json({
      status: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number,
        is_blocked: user.is_blocked,
        batting: user.batting,
        devices: user.devices
      }
    });

  } catch (error: unknown) {

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: {params: Promise<{id:string}>}) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError('Invalid user ID');
    }

    const user = await AppUser.findById(id);
    if (!user) {
      throw new ApiError('User not found');
    }

    return NextResponse.json({
      status: true,
      data: {
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number,
        is_blocked: user.is_blocked,
        batting: user.batting,
        balance: user.balance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // devices: user.devices
      }
    });

  } catch (error: unknown) {

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
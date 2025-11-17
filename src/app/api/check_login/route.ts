import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';
import mongoose from 'mongoose';
import GameSettings from '@/models/GameSettings';
import ManageQR from '@/models/ManageQR';
import ManageUpi from '@/models/ManageUpi';

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Parse body
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      throw new ApiError('User ID is required');
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError('Invalid user ID');
    }

    const user = await AppUser.findById(user_id);
    if (!user) {
      throw new ApiError('User not found');
    }

    // ✅ Fetch payment method status
    const activeQR = await ManageQR.findOne({ is_active: true });
    const activeUPI = await ManageUpi.findOne({ is_active: true });

    const payment_status = activeQR ? 1 : activeUPI ? 0 : null;

    const settings = await GameSettings.findOne();
    const galidisawar = settings?.galidisawar ?? false;
    const starline = settings?.starline ?? false;

    return NextResponse.json({
      status: true,
      data: {
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number,
        m_pin:user.m_pin,
        email: user.email || "",
        date_of_birth: user.date_of_birth || "",
        address: user.address || "",
        occupation: user.occupation || "",
        is_verified: user.is_verified,
        batting: user.batting,
        balance: user.balance,
        galidisawar,
        starline,
        payment_status // 1 = QR active, 0 = UPI active
      },
    });

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' },
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' },
    );
  }
}

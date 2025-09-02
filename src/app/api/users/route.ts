import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await AppUser.find({}).select('name mobile_number is_blocked batting balance created_at devices');
    
    return NextResponse.json({
      status: true,
      data: users.map(user => ({
        id: user._id,
        name: user.name,
        mobile_number: user.mobile_number,
        is_blocked: user.is_blocked,
        batting: user.batting,
        balance: user.balance,
        created_at: user.createdAt,
        device_count: user.devices.length
      }))
    });

  } catch (error: unknown) {

    if (error instanceof Error) {
      return NextResponse.json(
        { status: false, message: error.message || 'Internal server error' }
      );
    }

    return NextResponse.json(
      { status: false, message: 'Internal server error' }
    );
  }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await AppUser.find({}).select('name mobile_number is_blocked batting balance created_at devices m_pin');
    
    return NextResponse.json({
      status: true,
      data: users
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
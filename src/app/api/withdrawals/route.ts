import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Withdrawal from '@/models/Withdrawal';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // ✅ Fetch withdrawals of user
    const withdrawals = await Withdrawal.find({}).populate('user_id',"name mobile_number")
      .sort({ createdAt: -1 }) // latest first
      .lean();

    return NextResponse.json({
      status: true,
      data: withdrawals,
    });
  } catch (error: unknown) {
    console.error('Withdrawal GET Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch withdrawals';
    return NextResponse.json({ status: false, message: errorMessage });
  }
}
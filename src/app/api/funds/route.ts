import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Fund from '@/models/Fund';



export async function GET(
  request: Request
) {
  try {
    await dbConnect();

    const funds = await Fund.find({ }).populate('user_id', 'name mobile_number')
        .sort({ created_at: -1 })
        .lean();

    return NextResponse.json({
      status: true,
      message: 'Funds fetched successfully',
      data:funds
    });
  } catch (error: unknown) {
    console.error('Get Funds Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch funds';
    return NextResponse.json(
      { status: false, message: errorMessage }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import StarlineBid from '@/models/StarlineBid';
import ApiError from '@/lib/errors/APiError';
import { transformBids, BidDocument } from '@/utils/transformbid';

export async function POST(
  request: Request 
) {
  try {
    await dbConnect();
 const body = await request.json()
    const { user_id } = await body;
    if (!user_id) throw new ApiError("User ID is required");

    // Cast the result to BidDocument[] to handle the lean() return type
    const bids = await StarlineBid.find({ user_id })
      .populate("user_id", "name mobile_number")
      .populate("bids.game_id", "game_name")
      .sort({ created_at: -1 })
      .lean() as unknown as BidDocument[];

    return NextResponse.json({
      status: true,
      data: transformBids(bids),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ status: false, message: error.message || "Failed to fetch user bids" });
    }
  }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import GalidisawarBid from '@/models/GalidisawarBid';
import ApiError from '@/lib/errors/APiError';
import { transformBids } from '@/utils/transformbid';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    await dbConnect();

    const {user_id} = await params;
    if (!user_id) throw new ApiError("User ID is required");

    const bids = await GalidisawarBid.find({ user_id })
      .populate("user_id", "name mobile_number")
      .populate("bids.game_id", "game_name")
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({
      status: true,
      data: transformBids(bids),
    });
  } catch (error: unknown) {
    if(error instanceof Error){
      return NextResponse.json({ status: false, message: "Failed to fetch user bids" });
    }
  }
}

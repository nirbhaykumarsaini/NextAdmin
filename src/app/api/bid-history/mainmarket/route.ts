import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import ApiError from '@/lib/errors/APiError';
import { BidDocument, transformBids } from '@/utils/transformbid';


export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json()

        const { user_id } = await body;
        if (!user_id) throw new ApiError("User ID is required");

        const bids = await MainMarketBid.find({ user_id })
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
            return NextResponse.json({ status: false, message: "Failed to fetch user bids" });
        }
    }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
// import Bid from '@/models/Bid'; // Assuming you have a Bid model
// import User from '@/models/User'; // Assuming you have a User model

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { result_date, game_name, session, panna, digit } = body;

        // Validate required fields
        if (!result_date || !game_name || !session || !panna || !digit) {
            throw new ApiError('All fields are required');
        }

        // Find all winning bids for this result
        // const winningBids = await Bid.find({
        //     date,
        //     gameName,
        //     session,
        //     panna,
        //     status: 'pending' 
        // }).populate('userId', 'username name');

        // Calculate total bid amount and winning amount
        // let totalBidAmount = 0;
        // let totalWinningAmount = 0;

        // const winners = winningBids.map(bid => {
        //     const bidAmount = bid.amount || 0;
        //     const winningAmount = bidAmount * 9; 

        //     totalBidAmount += bidAmount;
        //     totalWinningAmount += winningAmount;

        //     return {
        //         userId: bid.userId._id,
        //         userName: bid.userId.username || bid.userId.name,
        //         bidAmount,
        //         winningAmount,
        //         gameType: bid.gameType || 'Panna',
        //         bidDate: bid.createdAt
        //     };
        // });

        return NextResponse.json({
            status: true,
            data:[]
            // data: {
            //     panna,
            //     digit,
            //     totalBidAmount,
            //     totalWinningAmount,
            //     winners,
            //     winnerCount: winners.length
            // }
        });

    } catch (error: unknown) {
        console.error('Error fetching winners:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch winners'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}



import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import mongoose, { Types } from 'mongoose';
import MainMarketWinner from '@/models/MainMarketWinner';
import AppUser from '@/models/AppUser';

interface WinnerItem {
    user_id: Types.ObjectId;
    user: string;
    game_name: string;
    game_type: string;
    panna?: string;
    digit?: string;
    session?: string;
    winning_amount: number;
    bid_amount: number;
    _id?: Types.ObjectId;
}

interface AggregationResult {
    _id: Types.ObjectId;
    result_date: Date;
    winner: WinnerItem;
    createdAt: Date;
    updatedAt: Date;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const user_id = body.user_id; // Assuming the request body has { user_id: "..." }

        let aggregationPipeline: any[] = [];

        if (user_id && mongoose.Types.ObjectId.isValid(user_id)) {
            // Filter by user_id directly in the aggregation pipeline
            aggregationPipeline = [
                {
                    $match: {
                        'winners.user_id': new Types.ObjectId(user_id)
                    }
                },
                {
                    $unwind: '$winners'
                },
                {
                    $match: {
                        'winners.user_id': new Types.ObjectId(user_id)
                    }
                },
                {
                    $project: {
                        result_date: 1,
                        winner: '$winners',
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];
        } else {
            // Get all winners without filtering
            aggregationPipeline = [
                {
                    $unwind: '$winners'
                },
                {
                    $project: {
                        result_date: 1,
                        winner: '$winners',
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];
        }

        const winnersData = await MainMarketWinner.aggregate(aggregationPipeline) as AggregationResult[];

        const simplifiedData = winnersData.map((item) => ({
            id: item.winner._id?.toString() || new Types.ObjectId().toString(),
            result_date: item.result_date,
            user_id: item.winner.user_id,
            user: item.winner.user,
            game_name: item.winner.game_name,
            game_type: item.winner.game_type,
            digit: item.winner.digit,
            panna: item.winner.panna,
            session: item.winner.session,
            winning_amount: item.winner.winning_amount,
            bid_amount: item.winner.bid_amount,
            created_at: item.createdAt
        }));

        return NextResponse.json({
            status: true,
            data: simplifiedData,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch winners';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
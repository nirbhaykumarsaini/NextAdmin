import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import { Types } from 'mongoose';
import StarlineWinner from '@/models/StarlineWinner';

interface WinnerItem {
    user_id: string;
    user: string;
    game_name: string;
    game_type: string;
    panna?: string;
    digit?: string;
    winning_amount: number;
    bid_amount: number;
    _id?: Types.ObjectId;
}

interface AggregationResult {
    _id: Types.ObjectId;
    result_date: Date;
    winner: WinnerItem;
    createdAt: Date;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const user_id = body.user_id; // Assuming the request body has { user_id: "..." }

        let aggregationPipeline: any[] = [];

        if (user_id) {
            // Since user_id is stored as String in the schema, we can filter directly
            aggregationPipeline = [
                {
                    $match: {
                        'winners.user_id': user_id
                    }
                },
                {
                    $unwind: '$winners'
                },
                {
                    $match: {
                        'winners.user_id': user_id
                    }
                },
                {
                    $project: {
                        result_date: 1,
                        winner: '$winners',
                        createdAt: 1
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
                        createdAt: 1
                    }
                }
            ];
        }

        const winnersData = await StarlineWinner.aggregate(aggregationPipeline) as AggregationResult[];

        const simplifiedData = winnersData.map((item) => ({
            id: item.winner._id?.toString() || new Types.ObjectId().toString(),
            result_date: item.result_date,
            user_id: item.winner.user_id,
            user: item.winner.user,
            game_name: item.winner.game_name,
            game_type: item.winner.game_type,
            digit: item.winner.digit,
            panna: item.winner.panna,
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
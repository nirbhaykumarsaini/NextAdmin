import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import { Types } from 'mongoose';
import GalidisawarWinner from '@/models/GalidisawarWinner';

interface WinnerItem {
    user_id: Types.ObjectId;
    user: string;
    game_name: string;
    game_type: string;
    digit?: string;
    winning_amount: number;
    bid_amount: number;
    _id?: Types.ObjectId;
}

interface MainMarketWinnerDocument {
    _id: Types.ObjectId;
    result_date: Date;
    winners: WinnerItem[];
    createdAt: Date;
    updatedAt: Date;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const user_id = body.user_id;

        let query = {};
        
        // If user_id is provided, filter winners by user_id
        if (user_id && Types.ObjectId.isValid(user_id)) {
            query = {
                'winners.user_id': new Types.ObjectId(user_id)
            };
        }

        const winnersData = await GalidisawarWinner.find(query).maxTimeMS(15000).sort('-createdAt') as unknown as MainMarketWinnerDocument[];

        // Transform the data to a simpler format
        const simplifiedData = winnersData.flatMap(winnerDoc =>
            winnerDoc.winners
                // Filter winners by user_id if provided
                .filter(winner => !user_id || winner.user_id.toString() === user_id)
                .map(winner => ({
                    id: winner._id?.toString() || new Types.ObjectId().toString(),
                    result_date: winnerDoc.result_date,
                    user_id: winner.user_id,
                    user: winner.user,
                    game_name: winner.game_name,
                    game_type: winner.game_type,
                    digit: winner.digit,
                    winning_amount: winner.winning_amount,
                    bid_amount: winner.bid_amount,
                    created_at: winnerDoc.createdAt
                }))
        );

        return NextResponse.json({
            status: true,
            data: simplifiedData,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch winners';
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import GalidisawarResult from '@/models/GalidisawarResult';
import connectDB from '@/config/db';
import { Types } from 'mongoose';

interface StarlineResultDocument {
    result_date: string;
    game_id: { game_name: string };
    digit: string;
}



// GET all results
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const {game_id} = await request.json()

        // Get all results
        const results = await GalidisawarResult.find({ game_id })
            .populate('game_id', 'game_name')
            .sort({ result_date: -1, createdAt: -1 }) as unknown as StarlineResultDocument[];

        const transformedResults = results.map(result => ({
            result_date: result.result_date,
            game_name: result.game_id?.game_name || 'Unknown Game', // Extract game_name
            digit: result.digit
        }));

        return NextResponse.json({
            status: true,
            data: transformedResults
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve results'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
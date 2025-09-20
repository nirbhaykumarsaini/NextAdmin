import connectDB from "@/config/db";
import StarlineResult from "@/models/StarlineResult";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";





interface StarlineResultDocument {
    result_date: string;
    game_id: { game_name: string };
    panna: string;
    digit: string;
    _id: Types.ObjectId;
    created_at?: Date;
    updated_at?: Date;
}

// GET all results
export async function POST(
    request: NextRequest
) {
    try {
        await connectDB();

        const game_id = request.body;

        // Get all results with population
        const results = await StarlineResult.find({game_id})
            .populate('game_id', 'game_name')
            .sort({ result_date: -1, createdAt: -1 })
            .lean() as unknown as StarlineResultDocument[];

        // Transform the results to flatten game_name
        const transformedResults = results.map(result => ({
            result_date: result.result_date,
            game_name: result.game_id?.game_name || 'Unknown Game', // Extract game_name
            panna: result.panna || "***",
            digit: result.digit || "*",

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
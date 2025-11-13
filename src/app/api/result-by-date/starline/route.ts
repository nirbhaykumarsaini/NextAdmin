
import { NextRequest, NextResponse } from 'next/server';
import StarlineResult from '@/models/StarlineResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import { StarlineResultDocument } from '../../starline/results/route';



// GET all results
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json() || {};
        const result_date = body.result_date;

        if (!result_date) {
            throw new ApiError('Result Date is required');
        }

        // ✅ Fetch results for today
        const results = await StarlineResult.find({ result_date })
            .populate('game_id', 'game_name')
            .sort({ createdAt: -1 })
            .lean() as unknown as StarlineResultDocument[];

        // ✅ Transform and flatten response
        const transformedResults = results.map(result => ({
            _id: result._id,
            result_date: result.result_date,
            game_name: result.game_id?.game_name || 'Unknown Game',
            panna: result.panna,
            digit: result.digit,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
        }));

        return NextResponse.json({
            status: true,
            data: transformedResults,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve results';
        return NextResponse.json({ status: false, message: errorMessage });
    }
}
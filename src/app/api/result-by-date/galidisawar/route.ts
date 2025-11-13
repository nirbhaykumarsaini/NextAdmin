import { NextRequest, NextResponse } from 'next/server';
import GalidisawarResult from '@/models/GalidisawarResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import { GalidisawarResultDocument } from '../../galidisawar/results/route';

interface Body {
    result_date: string
}
// GET all results
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        let body: Body = {
            result_date: ''
        };
        try {
            body = await request.json();
        } catch {
            body = { result_date: '' }; // Fallback if no JSON body provided
        }
        const result_date = body.result_date;

        if (!result_date) throw new ApiError('Result Date is required')

        // ✅ Fetch today's results
        const results = await GalidisawarResult.find({ result_date })
            .populate('game_id', 'game_name')
            .sort({ createdAt: -1 })
            .lean() as unknown as GalidisawarResultDocument[];

        // ✅ Transform results
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
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to retrieve results';
        return NextResponse.json({ status: false, message: errorMessage });
    }
}
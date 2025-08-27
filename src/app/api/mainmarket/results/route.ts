
import { NextRequest, NextResponse } from 'next/server';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all results
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const result_date = searchParams.get('result_date');
        const game_name = searchParams.get('game_name');

        let query = {};
        if (result_date) {
            query = { ...query, result_date };
        }
        if (game_name) {
            query = { ...query, game_name };
        }

        // Get all results
        const results = await MainMarketResult.find(query).sort({ result_date: -1, createdAt: -1 });

        // Group results by date and game
        const groupedResults = results.reduce((acc: any, result) => {
            const key = `${result.result_date}-${result.game_name}`;

            if (!acc[key]) {
                acc[key] = {
                    result_date: result.result_date,
                    game_name: result.game_name,
                    openSession: null,
                    closeSession: null
                };
            }

            if (result.session === 'Open') {
                acc[key].openSession = {
                    panna: result.panna,
                    digit: result.digit,
                    _id: result._id
                };
            } else if (result.session === 'Close') {
                acc[key].closeSession = {
                    panna: result.panna,
                    digit: result.digit,
                    _id: result._id
                };
            }

            return acc;
        }, {});

        // Convert to array
        const groupedResultsArray = Object.values(groupedResults);

        return NextResponse.json({
            status: true,
            data: groupedResultsArray
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve results'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// CREATE a new result
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { result_date, game_name, session, panna, digit } = body;

        // Validate required fields
        if (!result_date) {
            throw new ApiError('Date is required');
        }
        if (!game_name) {
            throw new ApiError('Game name is required');
        }
        if (!session) {
            throw new ApiError('Session is required');
        }
        if (!panna) {
            throw new ApiError('Panna is required');
        }
        if (!digit) {
            throw new ApiError('Digit is required');
        }

        // Check if result already exists for this date, game, and session
        const existingResult = await MainMarketResult.findOne({
            game_name,
            result_date,
            session
        });

        if (existingResult) {
            throw new ApiError('Result already exists for this date, game, and session');
        }

        // Create the new result
        await MainMarketResult.create({
            result_date,
            game_name,
            session,
            panna,
            digit
        });

        // Get all results grouped by date and game
        await MainMarketResult.find().sort({ result_date: -1, createdAt: -1 });

        return NextResponse.json({
            status: true,
            message: 'Result created successfully',
        });

    } catch (error: unknown) {
        console.error('Error creating result:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create result'
        return NextResponse.json(
            { status: false, message: errorMessage  }
        );
    }
}

// DELETE a result by ID
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Result ID is required');
        }

        // Find and delete the result
        const result = await MainMarketResult.findByIdAndDelete(id);

        if (!result) {
            throw new ApiError('Result not found');
        }

        // Get all results grouped by date and game
        await MainMarketResult.find().sort({ result_date: -1, createdAt: -1 });

        return NextResponse.json({
            status: true,
            message: 'Result deleted successfully',
        });

    } catch (error: unknown) {
        console.error('Error deleting result:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete result'
        return NextResponse.json(
            { status: false, message: errorMessage  }
        );
    }
}
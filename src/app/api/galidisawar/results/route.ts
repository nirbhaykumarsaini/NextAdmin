
import { NextRequest, NextResponse } from 'next/server';
import GalidisawarResult from '@/models/GalidisawarResult';
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
        const results = await GalidisawarResult.find(query).sort({ result_date: -1, createdAt: -1 });

        return NextResponse.json({
            status: true,
            data: results
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message :  'Failed to retrieve results'
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
        const { result_date, game_name, digit } = body;

        // Validate required fields
        if (!result_date) {
            throw new ApiError('Date is required');
        }
        if (!game_name) {
            throw new ApiError('Game name is required');
        }
        if (!digit) {
            throw new ApiError('Digit is required');
        }

        // Check if result already exists for this date, game, and session
        const existingResult = await GalidisawarResult.findOne({
            game_name,
            result_date,
        });

        if (existingResult) {
            throw new ApiError('Result already exists for this date, game');
        }

        // Create the new result
        await GalidisawarResult.create({
            result_date,
            game_name,
            digit
        });
    
        return NextResponse.json({
            status: true,
            message: 'Result created successfully',
        });

    } catch (error: unknown) {
        console.error('Error creating result:', error);
        const errorMessage = error instanceof Error ? error.message :  'Failed to create result'
        return NextResponse.json(
            { status: false, message: errorMessage }
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
        const result = await GalidisawarResult.findByIdAndDelete(id);

        if (!result) {
            throw new ApiError('Result not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Result deleted successfully',
        });

    } catch (error: unknown) {
        console.error('Error deleting result:', error);
        const errorMessage = error instanceof Error ? error.message :  'Failed to delete result'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
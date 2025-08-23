
import { NextRequest, NextResponse } from 'next/server';
import StarlineResult from '@/models/StarlineResult';
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
        const results = await StarlineResult.find(query).sort({ result_date: -1, createdAt: -1 });

        return NextResponse.json({
            status: true,
            data: results
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to retrieve results' }
        );
    }
}

// CREATE a new result
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { result_date, game_name, panna, digit } = body;

        // Validate required fields
        if (!result_date) {
            throw new ApiError('Date is required');
        }
        if (!game_name) {
            throw new ApiError('Game name is required');
        }
        if (!panna) {
            throw new ApiError('Panna is required');
        }
        if (!digit) {
            throw new ApiError('Digit is required');
        }

        // Check if result already exists for this date, game, and session
        const existingResult = await StarlineResult.findOne({
            game_name,
            result_date,
        });

        if (existingResult) {
            throw new ApiError('Result already exists for this date, game');
        }

        // Create the new result
        const result = await StarlineResult.create({
            result_date,
            game_name,
            panna,
            digit
        });
    
        return NextResponse.json({
            status: true,
            message: 'Result created successfully',
        });

    } catch (error: any) {
        console.error('Error creating result:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to create result' }
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
        const result = await StarlineResult.findByIdAndDelete(id);

        if (!result) {
            throw new ApiError('Result not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Result deleted successfully',
        });

    } catch (error: any) {
        console.error('Error deleting result:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to delete result' }
        );
    }
}
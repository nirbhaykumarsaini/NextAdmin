
import { NextRequest, NextResponse } from 'next/server';
import GalidisawarResult from '@/models/GalidisawarResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import GalidisawarWinner from '@/models/GalidisawarWinner';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import { Types } from 'mongoose';

interface StarlineResultDocument {
    result_date: string;
    game_id: { game_name: string };
    panna: string;
    digit: string;
    _id: Types.ObjectId;
    created_at?: Date;
    updated_at?: Date;
}



// CREATE a new result
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { result_date, game_id, digit, winners } = body;

        // Validate required fields
        if (!result_date) {
            throw new ApiError('Date is required');
        }
        if (!game_id) {
            throw new ApiError('Game id is required');
        }
        if (!digit) {
            throw new ApiError('Digit is required');
        }

        // Check if result already exists for this date, game, and session
        const existingResult = await GalidisawarResult.findOne({
            game_id,
            result_date,
        });

        if (existingResult) {
            throw new ApiError('Result already exists for this date, game');
        }

        // Create the new result
        await GalidisawarResult.create({
            result_date,
            game_id,
            digit
        });

        let processedWinners: any[] = [];

        if (winners.length > 0) {
            // Process each winner to create transactions and update balances
            for (const winner of winners) {
                const { user_id, game_id, bid_id, win_amount } = winner;

                // Validate winner data
                if (!user_id || !game_id || !bid_id || win_amount === undefined) {
                    console.warn('Invalid winner data:', winner);
                    continue;
                }

                // Create transaction for the win
                const transaction = await Transaction.create({
                    user_id: new Types.ObjectId(user_id),
                    type: 'win',
                    amount: win_amount,
                    description: `Win from ${game_id}  on ${result_date}`,
                    status: 'completed'
                });

                // Update user balance
                await AppUser.findByIdAndUpdate(
                    user_id,
                    { $inc: { balance: win_amount } },
                    { new: true }
                );

                processedWinners.push({
                    user_id: new Types.ObjectId(user_id),
                    game_id: new Types.ObjectId(game_id),
                    bid_id: new Types.ObjectId(bid_id),
                    win_amount,
                    transaction_id: transaction._id
                });
            }

            // Save winners to MainMarketWinner collection
            if (processedWinners.length > 0) {
                await GalidisawarWinner.create({
                    result_date,
                    winners: processedWinners
                });
            }
        }

        return NextResponse.json({
            status: true,
            message: 'Result created successfully',
        });

    } catch (error: unknown) {
        console.error('Error creating result:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create result'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// GET all results
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const result_date = searchParams.get('result_date');
        const game_id = searchParams.get('game_id');

        let query = {};
        if (result_date) {
            query = { ...query, result_date };
        }
        if (game_id) {
            query = { ...query, game_id };
        }

        // Get all results
        const results = await GalidisawarResult.find(query)
        .populate('game_id', 'game_name') 
        .sort({ result_date: -1, createdAt: -1 }) as unknown as StarlineResultDocument[];

         const transformedResults = results.map(result => ({
            _id: result._id,
            result_date: result.result_date,
            game_name: result.game_id?.game_name || 'Unknown Game', // Extract game_name
            panna: result.panna,
            digit: result.digit,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete result'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
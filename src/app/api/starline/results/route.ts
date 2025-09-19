
import { NextRequest, NextResponse } from 'next/server';
import StarlineResult from '@/models/StarlineResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import StarlineWinner from '@/models/StarlineWinner';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import { Types } from 'mongoose';
import { parseDDMMYYYY } from '@/utils/date';

interface StarlineResultDocument {
    result_date: string;
    game_id: { game_name: string };
    panna: string;
    digit: string;
    _id: Types.ObjectId;
    created_at?: Date;
    updated_at?: Date;
}

interface ProcessedWinner {
    user_id:Types.ObjectId;
    user: string;
    game_name: string;
    game_type: string;
    panna: string;
    digit: string;
    winning_amount: number;
    bid_amount: number;
}


// CREATE a new result
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { result_date, game_id, panna, digit, winners } = body;

        // Validate required fields
        if (!result_date) {
            throw new ApiError('Date is required');
        }
        if (!game_id) {
            throw new ApiError('Game id is required');
        }
        if (!panna) {
            throw new ApiError('Panna is required');
        }
        if (!digit) {
            throw new ApiError('Digit is required');
        }

        if (!winners || !Array.isArray(winners)) {
            throw new ApiError('Winners must be an array');
        }

        // Check if result already exists for this date, game, and session
        const existingResult = await StarlineResult.findOne({
            game_id,
            result_date,
        });

        if (existingResult) {
            throw new ApiError('Result already exists for this date, game');
        }

        // Create the new result
        await StarlineResult.create({
            result_date,
            game_id,
            panna,
            digit
        });

        const processedWinners: ProcessedWinner[] = [];

        if (winners.length > 0) {
            // Process each winner to create transactions and update balances
            for (const winner of winners) {
                const { user,user_id, game, game_type, amount, winning_amount, digit: winnerDigit, panna: winnerPanna } = winner;

                // Validate winner data
                if (!user || winning_amount === undefined) {
                    console.warn('Invalid winner data:', winner);
                    continue;
                }
                try {

                    const userDoc = await AppUser.findOne({ name: user });
                    if (!userDoc) {
                        console.warn(`User not found: ${user}`);
                        continue;
                    }

                    // Create transaction for the win
                     await Transaction.create({
                        user_id: userDoc._id,
                        type: 'credit',
                        amount: winning_amount,
                        description: `Win from ${game}  on ${result_date}`,
                        status: 'completed'
                    });

                    // Update user balance
                    await AppUser.findByIdAndUpdate(
                        userDoc._id,
                        { $inc: { balance: winning_amount } },
                        { new: true }
                    );

                    processedWinners.push({
                        user_id,
                        user,
                        game_name: game,
                        game_type,
                        panna: winnerPanna,
                        digit: winnerDigit,
                        winning_amount,
                        bid_amount: amount
                    });
                } catch (error) {
                    console.error('Error processing winner:', error);
                    continue;
                }
            }

            // Save winners to MainMarketWinner collection
            if (processedWinners.length > 0) {
                await StarlineWinner.create({
                    result_date: parseDDMMYYYY(result_date),
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

        // Get all results with population
        const results = await StarlineResult.find(query)
            .populate('game_id', 'game_name')
            .sort({ result_date: -1, createdAt: -1 })
            .lean() as unknown as StarlineResultDocument[];

        // Transform the results to flatten game_name
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
        const result = await StarlineResult.findByIdAndDelete(id);

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
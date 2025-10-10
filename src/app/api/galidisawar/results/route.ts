import { NextRequest, NextResponse } from 'next/server';
import GalidisawarResult from '@/models/GalidisawarResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import GalidisawarWinner from '@/models/GalidisawarWinner';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose, { Types } from 'mongoose';
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

interface WinnerData {
    user_id: Types.ObjectId;
    user: string;
    game_type: string;
    game: string;
    amount: number;
    winning_amount: number;
    digit?: string;
}

interface ProcessedWinner {
    user_id: Types.ObjectId;
    user: string;
    game_name: string;
    game_type: string;
    digit: string | undefined;
    winning_amount: number;
    bid_amount: number;
    transaction_id: Types.ObjectId;
}


// CREATE a new result
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { result_date, game_id, digit, winners } = body;

        if (!result_date) throw new ApiError('Date is required');
        if (!game_id) throw new ApiError('Game id is required');
        if (!digit) throw new ApiError('Digit is required');

        // Check duplicate result
        const existingResult = await GalidisawarResult.findOne({ game_id, result_date });
        if (existingResult) {
            throw new ApiError('Result already exists for this date, game');
        }

        // Create result entry
        await GalidisawarResult.create({ result_date, game_id, digit });

        const winnerDocs: ProcessedWinner[] = [];

        if (winners && winners.length > 0) {
            for (const winner of winners as WinnerData[]) {
                const { user, user_id, game, amount, winning_amount, game_type, digit } = winner;

                if (!user || !game || !game_type || winning_amount === undefined) {
                    console.warn('Invalid winner data:', winner);
                    continue;
                }

                let userId: Types.ObjectId | null = null;

                // Validate if user is ObjectId
                if (Types.ObjectId.isValid(user)) {
                    userId = new Types.ObjectId(user);

                    // Create transaction only if valid userId
                    const transaction = await Transaction.create({
                        user_id: userId,
                        type: 'win',
                        amount: winning_amount,
                        description: `Win from ${game} on ${result_date}`,
                        status: 'completed'
                    });

                    // Update user balance
                    await AppUser.findByIdAndUpdate(
                        userId,
                        { $inc: { balance: winning_amount } },
                        { new: true }
                    );

                    // Save winner entry regardless (string or ObjectId)
                    winnerDocs.push({
                        user_id,
                        user,
                        game_name: game,
                        game_type,
                        digit,
                        winning_amount,
                        bid_amount: amount,
                        transaction_id: transaction._id
                    });
                } else {
                    console.warn(`Skipping transaction: invalid userId (${user})`);
                }

            }

            if (winnerDocs.length > 0) {
                await GalidisawarWinner.create({
                    result_date: parseDDMMYYYY(result_date),
                    winners: winnerDocs
                });
            }
        }

        return NextResponse.json({
            status: true,
            message: 'Result created successfully',
        });

    } catch (error: unknown) {
        console.error('Error creating result:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create result';
        return NextResponse.json({ status: false, message: errorMessage });
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError('Invalid Result ID');
        }

        // Find and delete the result
        const deletedResult = await GalidisawarResult.findByIdAndDelete(id);

        if (!deletedResult) {
            throw new ApiError('Result not found');
        }

        const winnerResult = await GalidisawarWinner.findOne({
            result_date: parseDDMMYYYY(deletedResult.result_date)
        });

        if (winnerResult && winnerResult.winners.length > 0) {
            for (const winner of winnerResult.winners) {
                // 2.1 Deduct balance from users (revert win amount)
                await AppUser.findByIdAndUpdate(
                    winner.user_id,
                    { $inc: { balance: -winner.winning_amount } });

                if (winner.transaction_id) {
                    await Transaction.findByIdAndDelete(winner.transaction_id);
                }
            }

            // 2.3 Delete winner result record
            await GalidisawarWinner.deleteOne({ _id: winnerResult._id });
        }

        // 3. Delete the result
        await GalidisawarResult.findByIdAndDelete(id);

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
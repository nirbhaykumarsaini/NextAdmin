import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import GalidisawarBid from '@/models/GalidisawarBid';
import mongoose, { Types } from 'mongoose';
import GalidisawarRate from '@/models/GalidisawarRate';
import ApiError from '@/lib/errors/APiError';

interface Winners {
    _id: string;
    user: string;
    created_at: string;
    game_type: string;
    game: string;
    amount: number;
    winning_amount: number;
    digit?: string;
}

interface GameRates {
    left_digit_point: number;
    right_panna_point: number;
    jodi_panna_point: number;
}

interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
    mobile_number: string;
}

interface PopulatedGame {
    _id: Types.ObjectId;
    game_name: string;
}

interface PopulatedBid {
    _id: Types.ObjectId;
    digit?: string;
    panna?: string;
    bid_amount: number;
    game_id: PopulatedGame;
    game_type: string;
}

interface PopulatedMainMarketBid {
    _id: string;
    user_id: PopulatedUser;
    bids: PopulatedBid[];
    total_amount: number;
    created_at: Date;
    updated_at: Date;
}

// Helper function to calculate winning amount
export function calculateWinningAmount(gameType: string, bidAmount: number, gameRates: GameRates): number {
    const rateMap: Record<string, number> = {
        'left-digit': gameRates.left_digit_point,
        'right-panna': gameRates.right_panna_point,
        'jodi-digit': gameRates.jodi_panna_point,
    };

    const rate = rateMap[gameType] || 1;
    return bidAmount * rate;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { result_date, game_id, digit } = body;

        // Validate required fields
        if (!result_date || !game_id || digit === undefined) {
            return NextResponse.json(
                { status: false, message: 'Missing required fields' });
        }

        const jodiDigitStr = String(digit);
        if (jodiDigitStr.length !== 2 || !/^\d+$/.test(jodiDigitStr)) {
            throw new ApiError('Jodi digit must be a 2-digit number');
        }

        const leftDigit = jodiDigitStr[0]; // First character
        const rightDigit = jodiDigitStr[1]; // Second character

        // Get game rates
        const gameRates = await GalidisawarRate.findOne({}) as GameRates | null;
        if (!gameRates) {
            return NextResponse.json(
                { status: false, message: 'Game rates not configured' });
        }

        // Convert result_date to start and end of day for comparison
        // Parse the date in DD-MM-YYYY format
        const [day, month, year] = result_date.split('-').map(Number);
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

        // Find all bids for the specified date and game
        const bids = await GalidisawarBid.find({
            created_at: { $gte: startDate, $lte: endDate },
            'bids.game_id': new mongoose.Types.ObjectId(game_id)
        }).populate('user_id', 'name mobile_number')
            .populate('bids.game_id', 'game_name') as PopulatedMainMarketBid[];

        if (!bids || bids.length === 0) {
            return NextResponse.json({
                status: true,
                message: 'No bids found for the specified criteria',
                data: {
                    winners: [],
                    total_bid_amount: 0,
                    total_win_amount: 0
                }
            });
        }

        // Filter winning bids and calculate totals for winners only
        const winningBids: Winners[] = [];
        let totalBidAmount = 0;
        let totalWinAmount = 0;

        bids.forEach(mainBid => {
            mainBid.bids.forEach(bid => {
                // First check if the game matches
                if (!bid.game_id._id.equals(new mongoose.Types.ObjectId(game_id))) {
                    return;
                }

                let isWinner = false;
                let winningAmount = 0;

                // Check based on game type
                switch (bid.game_type) {

                    case 'left-digit':
                        // For these games, just check if digit matches
                        if (bid.digit === leftDigit) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;
                    case 'right-digit':
                        // For these games, just check if digit matches
                        if (bid.digit === rightDigit) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;
                    case 'jodi-digit':
                       if (bid.digit === jodiDigitStr) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;

                    default:
                        break;
                }

                if (isWinner) {
                    totalBidAmount += bid.bid_amount;
                    totalWinAmount += winningAmount;

                    winningBids.push({
                        _id: mainBid._id.toString(),
                        user: mainBid.user_id.name,
                        created_at: mainBid.created_at.toISOString(),
                        game_type: bid.game_type,
                        game: bid.game_id.game_name,
                        amount: bid.bid_amount,
                        winning_amount: winningAmount,
                        digit: bid.digit
                    });
                }
            });
        });

        return NextResponse.json({
            status: true,
            message: 'Winners retrieved successfully',
            data: {
                winners: winningBids,
                total_bid_amount: totalBidAmount,
                total_win_amount: totalWinAmount
            }
        });

    } catch (error: unknown) {
        console.error('Error checking winners:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to check winners';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
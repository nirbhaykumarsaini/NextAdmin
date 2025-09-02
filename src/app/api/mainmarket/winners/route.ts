import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import mongoose, { Types } from 'mongoose';
import MainMarketRate from '@/models/MainmarketRate';
import MainMarketWinner from '@/models/MainMarketWinner';

interface Winners {
    _id: string;
    user: string;
    created_at: string;
    game_type: string;
    session: string;
    game: string;
    amount: number;
    winning_amount: number;
    panna?: string;
    digit?: string;
}

interface GameRates {
    single_digit_point: number;
    jodi_digit_point: number;
    single_panna_point: number;
    double_panna_point: number;
    triple_panna_point: number;
    half_sangam_point: number;
    full_sangam_point: number;
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
    session?: 'open' | 'close';
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
function calculateWinningAmount(gameType: string, bidAmount: number, gameRates: GameRates): number {
    const rateMap: Record<string, number> = {
        'single-digit': gameRates.single_digit_point,
        'jodi-digit': gameRates.jodi_digit_point,
        'single-panna': gameRates.single_panna_point,
        'double-panna': gameRates.double_panna_point,
        'triple-panna': gameRates.triple_panna_point,
        'half-sangam': gameRates.half_sangam_point,
        'full-sangam': gameRates.full_sangam_point,
        'sp-motor': gameRates.single_panna_point,
        'dp-motor': gameRates.double_panna_point,
        'sp-dp-tp-motor': gameRates.triple_panna_point,
        'odd-even': gameRates.single_digit_point,
        'two-digit': gameRates.single_panna_point,
        'digit-base-jodi': gameRates.jodi_digit_point,
        'choice-panna': gameRates.single_panna_point,
        'red-bracket': gameRates.jodi_digit_point
    };

    const rate = rateMap[gameType] || 1;
    return bidAmount * rate;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { result_date, game_id, session, panna, digit } = body;

        // Validate required fields
        if (!result_date || !game_id || !session || !panna || digit === undefined) {
            return NextResponse.json(
                { status: false, message: 'Missing required fields' });
        }

        // Validate session is either "open" or "close"
        const sessionLower = session.toLowerCase();
        if (!["open", "close"].includes(sessionLower)) {
            return NextResponse.json(
                { status: false, message: 'Session must be either "open" or "close"' });
        }

        // Validate panna is 3 digits
        if (String(panna).length !== 3) {
            return NextResponse.json(
                { status: false, message: 'Panna must be 3 digits' });
        }

        // Validate digit is single digit
        if (String(digit).length !== 1) {
            return NextResponse.json(
                { status: false, message: 'Digit must be single digit' });
        }

        // Get game rates
        const gameRates = await MainMarketRate.findOne({}) as GameRates | null;
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
        const bids = await MainMarketBid.find({
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

        // Calculate sum of current panna digits
        const pannaSum = String(panna).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
        const pannaDigit = pannaSum > 9 ? String(pannaSum).slice(-1) : pannaSum;

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

                // For full-sangam, jodi-digit, and red-bracket, skip session check
                if (bid.game_type !== 'full-sangam' && bid.game_type !== 'jodi-digit' && bid.game_type !== 'red-bracket') {
                    // For half-sangam, we want to include both sessions when checking close session
                    if (bid.game_type !== 'half-sangam' && bid.session !== sessionLower) {
                        return;
                    }
                }

                let isWinner = false;
                let winningAmount = 0;

                // Check based on game type
                switch (bid.game_type) {
                    case 'full-sangam':
                        // Only check in close session
                        if (sessionLower !== 'close') return;

                        // For full-sangam, check if panna matches
                        if (bid.panna === panna) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;

                    case 'jodi-digit':
                    case 'red-bracket':
                        // Only check in close session
                        if (sessionLower !== 'close') return;

                        // For jodi-digit and red-bracket, check if digit matches
                        if (bid.digit === digit) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;

                    case 'half-sangam':
                        // For half-sangam, check if panna matches
                        if (bid.panna === panna) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;

                    case 'single-digit':
                    case 'odd-even':
                    case 'digit-base-jodi':
                        // For these games, just check if digit matches
                        if (bid.digit === digit) {
                            isWinner = true;
                            winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        }
                        break;

                    case 'single-panna':
                    case 'double-panna':
                    case 'triple-panna':
                    case 'sp-motor':
                    case 'dp-motor':
                    case 'sp-dp-tp-motor':
                    case 'choice-panna':
                    case 'two-digit':
                        // For panna-based games, check if panna matches and sum matches current digit
                        if (bid.panna === panna && pannaDigit.toString() === digit.toString()) {
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
                        session: bid.session || '',
                        game: bid.game_id.game_name,
                        amount: bid.bid_amount,
                        winning_amount: winningAmount,
                        panna: bid.panna,
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


// GET - Get all games
export async function GET(request: Request) {
    try {
        // Establish database connection
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        let filter = {};
        if (user_id) {
            filter = { user_id: user_id };
        }

        const winnersData = await MainMarketWinner.find(filter).maxTimeMS(15000);
        
        // Transform the data to a simpler format
        const simplifiedData = winnersData.flatMap(winnerDoc => 
            winnerDoc.winners.map(winner => ({
                id: winner._id.toString(),
                result_date: winnerDoc.result_date,
                user: winner.user,
                game_name: winner.game_name,
                game_type: winner.game_type,
                digit: winner.digit,
                panna: winner.panna,
                session: winner.session,
                winning_amount: winner.winning_amount,
                bid_amount: winner.bid_amount,
                created_at: winnerDoc.createdAt
            }))
        );

        return NextResponse.json({
            status: true,
            data: simplifiedData,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch winners';
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: 500 }
        );
    }
}
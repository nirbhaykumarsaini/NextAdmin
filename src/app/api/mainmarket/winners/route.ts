import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import mongoose, { Types } from 'mongoose';
import MainMarketRate from '@/models/MainmarketRate';
import MainMarketWinner from '@/models/MainMarketWinner';
import AppUser from '@/models/AppUser';

interface Winners {
    _id: string;
    user: string;
    user_id: Types.ObjectId;
    created_at: string;
    game_type: string;
    session?: string;
    game: string;
    amount: number;
    winning_amount: number;
    panna?: string;
    digit?: string;
    open_panna?: string;
    close_panna?: string;
}

interface GameRates {
    single_digit_point: number;
    jodi_digit_point: number;
    single_panna_point: number;
    double_panna_point: number;
    triple_panna_point: number;
    half_sangam_point: number;
    full_sangam_point: number;
    single_digit_amount: number;
    jodi_digit_amount: number;
    single_panna_amount: number;
    double_panna_amount: number;
    triple_panna_amount: number;
    half_sangam_amount: number;
    full_sangam_amount: number;
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
    open_panna?: string;
    close_panna?: string;
}

interface PopulatedMainMarketBid {
    _id: string;
    user_id: PopulatedUser;
    bids: PopulatedBid[];
    total_amount: number;
    created_at: Date;
    updated_at: Date;
}

interface WinnerItem {
    user: string;
    game_name: string;
    game_type: string;
    panna?: string;
    digit?: string;
    session?: string;
    winning_amount: number;
    bid_amount: number;
    _id?: Types.ObjectId;
}

interface AggregationResult {
    _id: Types.ObjectId;
    result_date: Date;
    winner: WinnerItem;
    createdAt: Date;
    updatedAt: Date;
}

// GET - Get all games
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        type PipelineStage =
            | { $match: { 'winners.user'?: string } }
            | { $unwind: string }
            | { $project: { result_date: number; winner: string; createdAt: number; updatedAt: number } };

        let aggregationPipeline: PipelineStage[] = [];

        if (user_id && mongoose.Types.ObjectId.isValid(user_id)) {
            // Find the user first
            const user = await AppUser.findById(user_id).select('name');
            if (!user) {
                return NextResponse.json({
                    status: true,
                    data: [],
                    message: 'User not found'
                });
            }

            // Use aggregation to filter winners by username
            aggregationPipeline = [
                {
                    $match: {
                        'winners.user': user.name
                    }
                },
                {
                    $unwind: '$winners'
                },
                {
                    $match: {
                        'winners.user': user.name
                    }
                },
                {
                    $project: {
                        result_date: 1,
                        winner: '$winners',
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];
        } else {
            // Get all winners without filtering
            aggregationPipeline = [
                {
                    $unwind: '$winners'
                },
                {
                    $project: {
                        result_date: 1,
                        winner: '$winners',
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];
        }

        const winnersData = await MainMarketWinner.aggregate(aggregationPipeline) as AggregationResult[];

        const simplifiedData = winnersData.map((item) => ({
            id: item.winner._id?.toString() || new Types.ObjectId().toString(),
            result_date: item.result_date,
            user: item.winner.user,
            game_name: item.winner.game_name,
            game_type: item.winner.game_type,
            digit: item.winner.digit,
            panna: item.winner.panna,
            session: item.winner.session,
            winning_amount: item.winner.winning_amount,
            bid_amount: item.winner.bid_amount,
            created_at: item.createdAt
        }));

        return NextResponse.json({
            status: true,
            data: simplifiedData,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch winners';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// Helper function to calculate winning amount
function calculateWinningAmount(gameType: string, bidAmount: number, gameRates: GameRates): number {
    const rateMap: Record<string, { amount: number; point: number }> = {
        'single-digit': { amount: gameRates.single_digit_amount, point: gameRates.single_digit_point },
        'jodi-digit': { amount: gameRates.jodi_digit_amount, point: gameRates.jodi_digit_point },
        'single-panna': { amount: gameRates.single_panna_amount, point: gameRates.single_panna_point },
        'double-panna': { amount: gameRates.double_panna_amount, point: gameRates.double_panna_point },
        'triple-panna': { amount: gameRates.triple_panna_amount, point: gameRates.triple_panna_point },
        'half-sangam': { amount: gameRates.half_sangam_amount, point: gameRates.half_sangam_point },
        'full-sangam': { amount: gameRates.full_sangam_amount, point: gameRates.full_sangam_point },
        'sp-motor': { amount: gameRates.single_panna_amount, point: gameRates.single_panna_point },
        'dp-motor': { amount: gameRates.double_panna_amount, point: gameRates.double_panna_point },
        'sp-dp-tp-motor': { amount: gameRates.triple_panna_amount, point: gameRates.triple_panna_point },
        'odd-even': { amount: gameRates.single_digit_amount, point: gameRates.single_digit_point },
        'two-digit': { amount: gameRates.triple_panna_amount, point: gameRates.triple_panna_point },
        'digit-base-jodi': { amount: gameRates.jodi_digit_amount, point: gameRates.jodi_digit_point },
        'choice-panna': { amount: gameRates.single_panna_amount, point: gameRates.single_panna_point },
        'red-bracket': { amount: gameRates.jodi_digit_amount, point: gameRates.jodi_digit_point }
    };

    const rate = rateMap[gameType] || { amount: 1, point: 1 };
    return bidAmount * (rate.amount / rate.point);
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

        // Process each bid to find winners
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

                totalBidAmount += bid.bid_amount;

                // Check based on game type
                switch (bid.game_type) {
                    case 'full-sangam':
                        // Only check in close session
                        if (sessionLower !== 'close') return;

                        // Check if bid has both open and close pannas that match current panna
                        if (bid.open_panna === panna && bid.close_panna === panna) {
                            const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                            winningBids.push({
                                _id: mainBid._id.toString(),
                                user: mainBid.user_id.name,
                                user_id: mainBid.user_id._id,
                                created_at: mainBid.created_at.toISOString(),
                                game_type: bid.game_type,
                                session: bid.session || '',
                                game: bid.game_id.game_name,
                                amount: bid.bid_amount,
                                winning_amount: winningAmount,
                                open_panna: bid.open_panna,
                                close_panna: bid.close_panna
                            });
                            totalWinAmount += winningAmount;
                        }
                        break;

                    case 'jodi-digit':
                    case 'red-bracket':
                        // Only check in close session
                        if (sessionLower !== 'close') return;
                        if (bid.digit && bid.digit.length === 2 &&
                            bid.digit[0].toString() === digit.toString() &&
                            bid.digit[1].toString() === digit.toString()) {
                            const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                            winningBids.push({
                                _id: mainBid._id.toString(),
                                user: mainBid.user_id.name,
                                user_id: mainBid.user_id._id,
                                created_at: mainBid.created_at.toISOString(),
                                game_type: bid.game_type,
                                session: bid.session || '',
                                game: bid.game_id.game_name,
                                amount: bid.bid_amount,
                                winning_amount: winningAmount,
                                digit: bid.digit
                            });
                            totalWinAmount += winningAmount;
                        }

                        break;

                    case 'half-sangam':
                        // For half-sangam, we want to check both open and close session bids when declaring close session
                            if (bid.session === "open") {
                                // For open session half-sangam, check if close_panna sum matches current digit
                                if (bid.close_panna) {
                                    const closeSum = String(bid.close_panna).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
                                    const calculatedCloseDigit = closeSum > 9 ? String(closeSum).slice(-1) : closeSum;
                                    if (calculatedCloseDigit.toString() === digit.toString()) {
                                        const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                                        winningBids.push({
                                            _id: mainBid._id.toString(),
                                            user: mainBid.user_id.name,
                                            user_id: mainBid.user_id._id,
                                            created_at: mainBid.created_at.toISOString(),
                                            game_type: bid.game_type,
                                            session: bid.session,
                                            game: bid.game_id.game_name,
                                            amount: bid.bid_amount,
                                            winning_amount: winningAmount,
                                            digit: bid.digit,
                                            close_panna: bid.close_panna
                                        });
                                        totalWinAmount += winningAmount;
                                    }
                                }
                            } else if (bid.session === "close") {
                                // For close session half-sangam, check if open_panna sum matches current digit
                                if (bid.open_panna) {
                                    const openSum = String(bid.open_panna).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
                                    const calculatedOpenDigit = openSum > 9 ? String(openSum).slice(-1) : openSum;
                                    if (calculatedOpenDigit.toString() === digit.toString()) {
                                        const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                                        winningBids.push({
                                            _id: mainBid._id.toString(),
                                            user: mainBid.user_id.name,
                                            user_id: mainBid.user_id._id,
                                            created_at: mainBid.created_at.toISOString(),
                                            game_type: bid.game_type,
                                            session: bid.session,
                                            game: bid.game_id.game_name,
                                            amount: bid.bid_amount,
                                            winning_amount: winningAmount,
                                            digit: bid.digit,
                                            open_panna: bid.open_panna
                                        });
                                        totalWinAmount += winningAmount;
                                    }
                                }
                            }
                        break;

                    case 'single-digit':
                    case 'odd-even':
                        // Check if digit matches
                        if (bid.session === sessionLower && bid.digit === digit.toString()) {
                            const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                            winningBids.push({
                                _id: mainBid._id.toString(),
                                user: mainBid.user_id.name,
                                user_id: mainBid.user_id._id,
                                created_at: mainBid.created_at.toISOString(),
                                game_type: bid.game_type,
                                session: bid.session,
                                game: bid.game_id.game_name,
                                amount: bid.bid_amount,
                                winning_amount: winningAmount,
                                digit: bid.digit
                            });
                            totalWinAmount += winningAmount;
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
                        // Check if panna matches and sum matches current digit
                        if (bid.session === sessionLower && bid.panna === panna && pannaDigit.toString() === digit.toString()) {
                            const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                            winningBids.push({
                                _id: mainBid._id.toString(),
                                user: mainBid.user_id.name,
                                user_id: mainBid.user_id._id,
                                created_at: mainBid.created_at.toISOString(),
                                game_type: bid.game_type,
                                session: bid.session,
                                game: bid.game_id.game_name,
                                amount: bid.bid_amount,
                                winning_amount: winningAmount,
                                panna: bid.panna
                            });
                            totalWinAmount += winningAmount;
                        }
                        break;

                    case 'digit-base-jodi':

                        if (bid.session === "open" && bid.digit) {
                            if (bid.digit[0].toString() === digit.toString()) {
                                const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                                winningBids.push({
                                    _id: mainBid._id.toString(),
                                    user: mainBid.user_id.name,
                                    user_id: mainBid.user_id._id,
                                    created_at: mainBid.created_at.toISOString(),
                                    game_type: bid.game_type,
                                    session: bid.session,
                                    game: bid.game_id.game_name,
                                    amount: bid.bid_amount,
                                    winning_amount: winningAmount,
                                    digit: bid.digit
                                });
                                totalWinAmount += winningAmount;
                            }
                        } else if (bid.session === "close" && bid.digit) {
                            if (bid.digit[1].toString() === digit.toString()) {
                                const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                                winningBids.push({
                                    _id: mainBid._id.toString(),
                                    user: mainBid.user_id.name,
                                    user_id: mainBid.user_id._id,
                                    created_at: mainBid.created_at.toISOString(),
                                    game_type: bid.game_type,
                                    session: bid.session,
                                    game: bid.game_id.game_name,
                                    amount: bid.bid_amount,
                                    winning_amount: winningAmount,
                                    digit: bid.digit
                                });
                                totalWinAmount += winningAmount;
                            }
                        }
                        // // Check if digit matches
                        // if (bid.session === sessionLower && bid.digit && bid.digit === String(digit).padStart(2, '0')) {
                        //     const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
                        //     winningBids.push({
                        //         _id: mainBid._id.toString(),
                        //         user: mainBid.user_id.name,
                        //         user_id: mainBid.user_id._id,
                        //         created_at: mainBid.created_at.toISOString(),
                        //         game_type: bid.game_type,
                        //         session: bid.session,
                        //         game: bid.game_id.game_name,
                        //         amount: bid.bid_amount,
                        //         winning_amount: winningAmount,
                        //         digit: bid.digit
                        //     });
                        //     totalWinAmount += winningAmount;
                        // }
                        break;

                    default:
                        break;
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
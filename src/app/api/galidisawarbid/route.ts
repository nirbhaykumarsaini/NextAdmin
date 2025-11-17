import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import GalidisawarBid from '@/models/GalidisawarBid';
import ApiError from '@/lib/errors/APiError';
import GalidisawarGame, { IGalidisawarGameDay } from '@/models/GalidisawarGame';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose, { Types } from 'mongoose';
import { validateBidEligibility } from '@/middleware/bidValidationMiddleware';

interface BidRequest {
    user_id?: string;
    bid_id: string;
    digit: string;
    bid_amount: number;
    game_id: string;
    game_type: 'left-digit' | 'right-digit' | 'jodi-digit';
}

interface GalidisawarBidRequest {
    user_id: string;
    bids: BidRequest[];
}

interface FilterType {
    created_at?: {
        $gte?: Date;
        $lte?: Date;
    };
    'bids.game_id'?: Types.ObjectId;
    'bids.game_type'?: string;
}

// Helper function to get current day and time
function getCurrentDayAndTime(): { currentDay: string; currentHours: number; currentMinutes: number } {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    return { currentDay, currentHours, currentMinutes };
}

// Helper function to parse open time to 24-hour format
function parseOpenTimeToMinutes(openTimeStr: string): { openHours: number; openMinutes: number } {
    const openTime = openTimeStr.toUpperCase().trim();
    const [timePart, period] = openTime.split(' ');
    const [openHours, openMinutes] = timePart.split(':').map(Number);

    // Convert to 24-hour format
    let adjustedHours = openHours;
    if (period === 'PM' && openHours !== 12) {
        adjustedHours += 12;
    } else if (period === 'AM' && openHours === 12) {
        adjustedHours = 0;
    }

    return { openHours: adjustedHours, openMinutes };
}

// Helper function to check if bidding is allowed
function isBiddingAllowed(
    currentHours: number,
    currentMinutes: number,
    openHours: number,
    openMinutes: number
): boolean {
    return currentHours < openHours ||
        (currentHours === openHours && currentMinutes < openMinutes);
}

// Helper function to find today's schedule
function findTodaySchedule(days: IGalidisawarGameDay[], currentDay: string): IGalidisawarGameDay | null {
    return days.find(day => day.day.toLowerCase() === currentDay) || null;
}

export async function POST(request: Request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await dbConnect();
        const body: GalidisawarBidRequest = await request.json();
        const { user_id, bids } = body;

        // Validate required fields
        if (!user_id || !bids || !Array.isArray(bids) || bids.length === 0) {
            throw new ApiError('User ID and bids array are required');
        }

        const eligibilityCheck = await validateBidEligibility(user_id);
        if (!eligibilityCheck.isValid) {
            throw new ApiError(eligibilityCheck.error || 'User not eligible for bidding');
        }

        // Get current day and time
        const { currentDay, currentHours, currentMinutes } = getCurrentDayAndTime();

        // Validate each bid
        for (const bid of bids) {
            // Validate amount
            if (!bid.bid_amount || bid.bid_amount <= 0 || isNaN(bid.bid_amount)) {
                throw new ApiError('Valid bid amount is required for each bid');
            }

            // Validate game type
            const validGameTypes = ['left-digit', 'right-digit', 'jodi-digit'];
            if (!bid.game_type || !validGameTypes.includes(bid.game_type)) {
                throw new ApiError(`Invalid game type. Must be one of: ${validGameTypes.join(', ')}`);
            }

            // Validate digit
            if (!bid.digit || bid.digit.toString().trim() === '') {
                throw new ApiError('Digit is required for each bid');
            }

            const digitStr = bid.digit.toString();

            // Validate digit format based on game type
            switch (bid.game_type) {
                case 'left-digit':
                case 'right-digit':
                    if (digitStr.length !== 1 || parseInt(digitStr) < 0 || parseInt(digitStr) > 9) {
                        throw new ApiError('Single digit must be a single number between 0-9');
                    }
                    break;
                case 'jodi-digit':
                    if (digitStr.length !== 2 || parseInt(digitStr) < 0 || parseInt(digitStr) > 99) {
                        throw new ApiError('Jodi digit must be a two-digit number between 00-99');
                    }
                    break;
            }

            // Validate game ID
            if (!bid.game_id || !Types.ObjectId.isValid(bid.game_id)) {
                throw new ApiError('Valid game ID is required for each bid');
            }

            // Check if game exists and is active
            const game = await GalidisawarGame.findById(bid.game_id).session(session);
            if (!game) {
                throw new ApiError(`Galidisawar game not found for ID: ${bid.game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Galidisawar game with ID ${bid.game_id} is inactive`);
            }

            // ✅ Check market status for today
            const todaySchedule = findTodaySchedule(game.days, currentDay);
            if (!todaySchedule) {
                throw new ApiError(`No schedule found for ${currentDay} for game ID: ${bid.game_id}`);
            }
            if (!todaySchedule.market_status) {
                throw new ApiError(`Market is closed for ${currentDay} for game ID: ${bid.game_id}`);
            }

            // ✅ Check game time validation - bids cannot be placed after open time
            const { openHours, openMinutes } = parseOpenTimeToMinutes(todaySchedule.open_time);

            if (!isBiddingAllowed(currentHours, currentMinutes, openHours, openMinutes)) {
                throw new ApiError(`Bids cannot be placed after the game's open time (${todaySchedule.open_time})`);
            }
        }

        // Check if user exists and has sufficient balance
        const user = await AppUser.findById(user_id).session(session);
        if (!user) {
            throw new ApiError('User not found');
        }

        if (user.is_blocked) {
            throw new ApiError('User account is blocked');
        }

        // Calculate total bid amount
        const totalBidAmount = bids.reduce((sum, bid) => sum + bid.bid_amount, 0);

        if (user.balance < totalBidAmount) {
            throw new ApiError('Insufficient balance');
        }

        // Create transaction records and deduct amount per bid
        const transactionIds: Types.ObjectId[] = [];
        let runningBalance = user.balance;

        for (const bid of bids) {
            const game = await GalidisawarGame.findById(bid.game_id).session(session);

            // Build description for each bid
            let extra = '';
            switch (bid.game_type) {
                case 'left-digit':
                    extra = `Left Digit: ${bid.digit}`;
                    break;
                case 'right-digit':
                    extra = `Right Digit: ${bid.digit}`;
                    break;
                case 'jodi-digit':
                    extra = `Jodi Digit: ${bid.digit}`;
                    break;
            }

            const description = `Galidisawar bid placed for ${game.game_name} (${bid.game_type.replace('-', ' ')} - ${extra})`;

            // Update running balance for this bid
            runningBalance -= bid.bid_amount;

            const transaction = new Transaction({
                user_id,
                amount: bid.bid_amount,
                type: 'debit',
                status: 'completed',
                balance_after: runningBalance,
                description
            });

            await transaction.save({ session });
            transactionIds.push(transaction._id);
        }

        // Update user balance with final amount
        user.balance = runningBalance;
        await user.save({ session });

        // Transform bids to match schema format
        const transformedBids = bids.map(bid => ({
            digit: bid.digit,
            bid_amount: bid.bid_amount,
            game_id: new Types.ObjectId(bid.game_id),
            game_type: bid.game_type
        }));

        // Create the galidisawar bid
        const galidisawarBid = new GalidisawarBid({
            user_id: new Types.ObjectId(user_id),
            bids: transformedBids,
            total_amount: totalBidAmount,
            transaction: transactionIds
        });

        await galidisawarBid.save({ session });

        // If you have referral reward logic, add it here
        // await checkAndRewardReferral(user_id, session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            status: true,
            message: 'Galidisawar bid placed successfully',
            data: {
                bid_id: galidisawarBid._id,
                total_amount: totalBidAmount,
                new_balance: user.balance,
                transaction_ids: transactionIds
            }
        });

    } catch (error: unknown) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();

        if (error instanceof ApiError) {
            return NextResponse.json({
                status: false,
                message: error.message
            }, { status: 400 });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to place galidisawar bid';

        return NextResponse.json({
            status: false,
            message: errorMessage
        }, { status: 500 });
    }
}


export async function PUT(request: Request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await dbConnect();
        const body: BidRequest = await request.json();
        const {
            bid_id,
            user_id,
            digit,
            bid_amount,
            game_id,
            game_type,
        } = body;

        // Validate required fields
        if (!bid_id || !user_id) {
            throw new ApiError('Bid ID and User ID are required');
        }

        // Find the main market bid document
        const mainMarketBid = await GalidisawarBid.findOne({
            'bids._id': bid_id,
            user_id
        }).session(session);

        if (!mainMarketBid) {
            throw new ApiError('Bid not found or does not belong to this user');
        }

        if (mainMarketBid.bids.length === 0) {
            throw new ApiError('No bids found in this document');
        }

        const originalBid = mainMarketBid.bids[0];
        const originalAmount = originalBid.bid_amount;

        // Validate and update fields if provided
        if (bid_amount !== undefined) {
            if (bid_amount <= 0 || isNaN(bid_amount)) {
                throw new ApiError('Valid bid amount is required');
            }
            originalBid.bid_amount = bid_amount;
        }
        const validGameTypes = ['left-digit', 'right-digit', 'jodi-digit'];
        if (game_type !== undefined) {

            if (!validGameTypes.includes(game_type)) {
                throw new ApiError('Valid game type is required');
            }
            originalBid.game_type = game_type;
        }

        if (game_id !== undefined) {
            // Check if game exists and is active
            const game = await GalidisawarGame.findById(game_id).session(session);
            if (!game) {
                throw new ApiError(`Game not found for ID: ${game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Game with ID ${game_id} is inactive`);
            }
            originalBid.game_id = new Types.ObjectId(game_id);
        }


        if (digit !== undefined) {
            const currentGameType = game_type || originalBid.game_type;

            if (validGameTypes.includes(currentGameType)) {
                if (!digit) {
                    throw new ApiError('Digit is required for this game type');
                }
                originalBid.digit = digit;
            } else {
                originalBid.digit = undefined;
            }
        }

        // Check if user exists and has sufficient balance for the difference
        const user = await AppUser.findById(user_id).session(session);
        if (!user) {
            throw new ApiError('User not found');
        }

        if (user.is_blocked) {
            throw new ApiError('User account is blocked');
        }

        // Calculate the difference in bid amount
        const newAmount = originalBid.bid_amount;
        const amountDifference = newAmount - originalAmount;

        if (amountDifference > 0 && user.balance < amountDifference) {
            throw new ApiError('Insufficient balance for this update');
        }

        // Update user balance if amount changed
        if (amountDifference !== 0) {
            user.balance -= amountDifference;
            await user.save({ session });

            // Create transaction record for the difference
            const transaction = new Transaction({
                user_id: user_id,
                amount: Math.abs(amountDifference),
                type: amountDifference > 0 ? 'debit' : 'credit',
                status: 'completed',
                description: `Bid ${amountDifference > 0 ? 'increase' : 'decrease'} for ${originalBid.game_type} game`
            });

            await transaction.save({ session });
        }

        // Save the updated bid
        await mainMarketBid.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json({
            status: true,
            message: 'Bid updated successfully',
            data: {
                bid_id: mainMarketBid._id,
                updated_bid: originalBid,
                new_balance: user.balance
            }
        });

    } catch (error: unknown) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();

        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to update bid';

        return NextResponse.json({ status: false, message: errorMessage });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const gameId = searchParams.get('game_id');
        const gameType = searchParams.get('game_type');

        // Build filter object dynamically
        const filter: FilterType = {};

        // Date filtering :cite[5]:cite[10]
        if (startDate || endDate) {
            filter.created_at = {};
            if (startDate) {
                filter.created_at.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
            }
            if (endDate) {
                filter.created_at.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
            }
        }

        // Game ID filtering
        if (gameId) {
            filter['bids.game_id'] = new mongoose.Types.ObjectId(gameId);
        }

        // Game type filtering
        if (gameType) {
            filter['bids.game_type'] = gameType;
        }

        // Execute query with dynamic filters :cite[2]
        const bids = await GalidisawarBid.aggregate([
            { $unwind: '$bids' },
            { $match: filter },
            {
                $lookup: {
                    from: 'galidisawargames',
                    localField: 'bids.game_id',
                    foreignField: '_id',
                    as: 'game_info'
                }
            },
            {
                $lookup: {
                    from: 'appusers',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },
            {
                $project: {
                    _id: '$bids._id',
                    user_id: 1,
                    name: { $arrayElemAt: ['$user_info.name', 0] },
                    digit: '$bids.digit',
                    panna: '$bids.panna',
                    bid_amount: '$bids.bid_amount',
                    game_id: '$bids.game_id',
                    game_name: { $arrayElemAt: ['$game_info.game_name', 0] },
                    game_type: '$bids.game_type',
                    session: '$bids.session',
                    created_at: 1
                }
            },
            { $sort: { created_at: -1 } }
        ]);

        return NextResponse.json({
            status: true,
            data: bids
        });

    } catch (error: unknown) {
        console.error('Error fetching bids:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bids';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
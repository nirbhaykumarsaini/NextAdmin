import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import StarlineBid from '@/models/StarlineBid';
import ApiError from '@/lib/errors/APiError';
import StarlineGame from '@/models/StarlineGame';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose, { Types } from 'mongoose';
import AccountSetting from '@/models/AccountSettings';
import { validateBidEligibility } from '@/middleware/bidValidationMiddleware';

interface BidRequest {
    user_id?: string;
    bid_id: string;
    digit?: string;
    panna?: string;
    bid_amount: number;
    game_id: string;
    game_type: 'single-digit' | 'single-panna' | 'double-panna' | 'triple-panna';
}

interface StarlineBidRequest {
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

// Helper function to convert time to 24-hour format and get current time in minutes
function getCurrentTimeInMinutes(): number {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    return currentHours * 60 + currentMinutes;
}

// Helper function to parse game open time to minutes
function parseOpenTimeToMinutes(openTimeStr: string): number {
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

    return adjustedHours * 60 + openMinutes;
}

// Helper function to check if bidding is allowed before open time
function isBiddingAllowed(currentTimeInMinutes: number, gameOpenTimeInMinutes: number): boolean {
    return currentTimeInMinutes < gameOpenTimeInMinutes;
}

export async function POST(request: Request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await dbConnect();
        const body: StarlineBidRequest = await request.json();
        const { user_id, bids } = body;

        // Validate required fields
        if (!user_id || !bids || !Array.isArray(bids) || bids.length === 0) {
            throw new ApiError('User ID and bids array are required');
        }

        const eligibilityCheck = await validateBidEligibility(user_id);
        if (!eligibilityCheck.isValid) {
            throw new ApiError(eligibilityCheck.error || 'User not eligible for bidding');
        }

        // Get current time in minutes for comparison
        const currentTimeInMinutes = getCurrentTimeInMinutes();

        // Get account settings for min/max bid validation
        const accountSettings = await AccountSetting.findOne();
        const minBidAmount = accountSettings?.min_bid_amount || 0;
        const maxBidAmount = accountSettings?.max_bid_amount || Infinity;

        // Validate each bid
        for (const bid of bids) {
            // Validate amount
            if (!bid.bid_amount || bid.bid_amount <= 0 || isNaN(bid.bid_amount)) {
                throw new ApiError('Valid bid amount is required for each bid');
            }

            // Check min/max bid amount
            if (bid.bid_amount < minBidAmount) {
                throw new ApiError(`Bid amount must be at least ${minBidAmount}`);
            }

            if (bid.bid_amount > maxBidAmount) {
                throw new ApiError(`Bid amount cannot exceed ${maxBidAmount}`);
            }

            // Validate game type
            const validGameTypes = ['single-digit', 'single-panna', 'double-panna', 'triple-panna'];
            if (!bid.game_type || !validGameTypes.includes(bid.game_type)) {
                throw new ApiError(`Invalid game type. Must be one of: ${validGameTypes.join(', ')}`);
            }

            // Validate digit/panna based on game type
            switch (bid.game_type) {
                case 'single-digit':
                    // For single-digit, digit is required and must be single number 0-9
                    if (!bid.digit || bid.digit.toString().trim() === '') {
                        throw new ApiError('Digit is required for single-digit game type');
                    }
                    const digitStr = bid.digit.toString();
                    if (digitStr.length !== 1 || !/^[0-9]$/.test(digitStr)) {
                        throw new ApiError('Single digit must be a single number between 0-9');
                    }
                    // Clean up panna field for single-digit
                    delete bid.panna;
                    break;

                case 'single-panna':
                case 'double-panna':
                case 'triple-panna':
                    // For panna games, panna is required and must be three digits
                    if (!bid.panna || bid.panna.toString().trim() === '') {
                        throw new ApiError('Panna is required for this game type');
                    }
                    const pannaStr = bid.panna.toString();
                    if (pannaStr.length !== 3 || !/^[0-9]{3}$/.test(pannaStr)) {
                        throw new ApiError('Panna must be a three-digit number (000-999)');
                    }
                    // Clean up digit field for panna games
                    delete bid.digit;
                    break;
            }

            // Validate game ID
            if (!bid.game_id || !Types.ObjectId.isValid(bid.game_id)) {
                throw new ApiError('Valid game ID is required for each bid');
            }

            // Check if game exists and is active
            const game = await StarlineGame.findById(bid.game_id).session(session);
            if (!game) {
                throw new ApiError(`Starline game not found for ID: ${bid.game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Starline game with ID ${bid.game_id} is inactive`);
            }
            if (!game.market_status) {
                throw new ApiError(`Market is closed for game ID: ${bid.game_id}`);
            }

            // ✅ Check game time validation - bids cannot be placed after open time
            const gameOpenTimeInMinutes = parseOpenTimeToMinutes(game.open_time);

            if (!isBiddingAllowed(currentTimeInMinutes, gameOpenTimeInMinutes)) {
                throw new ApiError(`Bids cannot be placed after the game's open time (${game.open_time})`);
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

        for (const bid of bids) {
            const game = await StarlineGame.findById(bid.game_id).session(session);

            // Build description for each bid
            const extraParts: string[] = [];
            if (bid.digit) extraParts.push(`Digit: ${bid.digit}`);
            if (bid.panna) extraParts.push(`Panna: ${bid.panna}`);

            const extra = extraParts.join(' | ') || 'No extra details';

            const description = `Starline bid placed for ${game.game_name} ( ${bid.game_type.replace('-', ' ')} - ${extra} )`;

            const transaction = new Transaction({
                user_id,
                amount: bid.bid_amount,
                type: 'debit',
                status: 'completed',
                balance_after: user.balance - bid.bid_amount,
                description
            });

            await transaction.save({ session });
            transactionIds.push(transaction._id);
        }

        // Deduct total amount from user balance
        user.balance -= totalBidAmount;
        await user.save({ session });

        // Transform bids to match schema format
        const transformedBids = bids.map(bid => ({
            digit: bid.digit,
            panna: bid.panna,
            bid_amount: bid.bid_amount,
            game_id: new Types.ObjectId(bid.game_id),
            game_type: bid.game_type
        }));

        // Create the starline bid
        const starlineBid = new StarlineBid({
            user_id: new Types.ObjectId(user_id),
            bids: transformedBids,
            total_amount: totalBidAmount,
            transaction: transactionIds
        });

        await starlineBid.save({ session });

        // If you have referral reward logic, add it here
        // await checkAndRewardReferral(user_id, session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            status: true,
            message: 'Starline bid placed successfully',
            data: {
                bid_id: starlineBid._id,
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
            });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to place starline bid';

        return NextResponse.json({
            status: false,
            message: errorMessage
        });
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
            panna,
            bid_amount,
            game_id,
            game_type,
        } = body;

        // Validate required fields
        if (!bid_id || !user_id) {
            throw new ApiError('Bid ID and User ID are required');
        }

        // Find the main market bid document
        const mainMarketBid = await StarlineBid.findOne({
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
        const validGameTypes = ['single-digit', 'single-panna', 'double-panna', 'triple-panna'];
        if (game_type !== undefined) {

            if (!validGameTypes.includes(game_type)) {
                throw new ApiError('Valid game type is required');
            }
            originalBid.game_type = game_type;
        }

        if (game_id !== undefined) {
            // Check if game exists and is active
            const game = await StarlineGame.findById(game_id).session(session);
            if (!game) {
                throw new ApiError(`Game not found for ID: ${game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Game with ID ${game_id} is inactive`);
            }
            originalBid.game_id = new Types.ObjectId(game_id);
        }
        const digitGameTypes = ['single-digit'];

        if (digit !== undefined) {
            const currentGameType = game_type || originalBid.game_type;

            if (digitGameTypes.includes(currentGameType)) {
                if (!digit) {
                    throw new ApiError('Digit is required for this game type');
                }
                originalBid.digit = digit;
            } else {
                originalBid.digit = undefined;
            }
        }

        const pannaGameTypes = ['single-panna', 'double-panna', 'triple-panna'];

        if (panna !== undefined) {
            const currentGameType = game_type || originalBid.game_type;

            if (pannaGameTypes.includes(currentGameType)) {
                if (!panna) {
                    throw new ApiError('Panna is required for this game type');
                }
                originalBid.panna = panna;
            } else {
                originalBid.panna = undefined;
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
        const bids = await StarlineBid.aggregate([
            { $unwind: '$bids' },
            { $match: filter },
            {
                $lookup: {
                    from: 'starlinegames',
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
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import StarlineBid from '@/models/StarlineBid';
import ApiError from '@/lib/errors/APiError';
import StarlineGame from '@/models/StarlineGame';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose, { Types } from 'mongoose';




interface BidRequest {
    user_id?: string;
    bid_id: string
    digit: string;
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

        // Validate each bid
        for (const bid of bids) {
            // Validate amount
            if (!bid.bid_amount || bid.bid_amount <= 0 || isNaN(bid.bid_amount)) {
                throw new ApiError('Valid bid amount is required for each bid');
            }

            // Validate game type
            const validGameTypes = ['single-digit', 'single-panna', 'double-panna', 'triple-panna'];
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
                case 'single-digit':
                    if (digitStr.length !== 1 || parseInt(digitStr) < 0 || parseInt(digitStr) > 9) {
                        throw new ApiError('Single digit must be a single number between 0-9');
                    }
                    break;
                case 'single-panna':
                    if (digitStr.length !== 3 || parseInt(digitStr) < 0 || parseInt(digitStr) > 999) {
                        throw new ApiError('Single panna must be a three-digit number');
                    }
                    break;
                case 'double-panna':
                    if (digitStr.length !== 3 || parseInt(digitStr) < 0 || parseInt(digitStr) > 999) {
                        throw new ApiError('Double panna must be a three-digit number');
                    }
                    break;
                case 'triple-panna':
                    if (digitStr.length !== 3 || parseInt(digitStr) < 0 || parseInt(digitStr) > 999) {
                        throw new ApiError('Triple panna must be a three-digit number');
                    }
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
        }

        // Check if user exists and has sufficient balance
        const user = await AppUser.findById(user_id).session(session);
        if (!user) {
            throw new ApiError('User not found');
        }

        if (!user.is_blocked) {
            throw new ApiError('User account is blocked');
        }

        // Calculate total bid amount
        const totalBidAmount = bids.reduce((sum, bid) => sum + bid.bid_amount, 0);

        if (user.balance < totalBidAmount) {
            throw new ApiError('Insufficient balance');
        }

        // Deduct amount from user balance
        user.balance -= totalBidAmount;
        await user.save({ session });

        // Create transaction record
        const transaction = new Transaction({
            user_id: user_id,
            amount: totalBidAmount,
            type: 'debit',
            status: 'completed',
            balance_after: user.balance,
            description: 'Starline bid placement'
        });

        await transaction.save({ session });

        // Transform bids to match schema format
        const transformedBids = bids.map(bid => ({
            digit: bid.digit,
            bid_amount: bid.bid_amount,
            game_id: new Types.ObjectId(bid.game_id),
            game_type: bid.game_type
        }));

        // Create the starline bid
        const starlineBid = new StarlineBid({
            user_id: new Types.ObjectId(user_id),
            bids: transformedBids,
            total_amount: totalBidAmount
        });

        await starlineBid.save({ session });

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
                transaction_id: transaction._id
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

        const errorMessage = error instanceof Error ? error.message : 'Failed to place starline bid';

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
        const mainMarketBid = await StarlineBid.findOne({
            _id: bid_id,
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

        if (!user.is_blocked) {
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
                    _id: 1,
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
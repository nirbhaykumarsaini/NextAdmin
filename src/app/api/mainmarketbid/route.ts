import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import ApiError from '@/lib/errors/APiError';
import MainMarketGame from '@/models/MainMarketGame';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose, { Types,PipelineStage } from 'mongoose';
import AccountSetting from '@/models/AccountSettings';

interface BidRequest {
    bid_id?: string;
    user_id?: string;
    digit?: string;
    panna?: string;
    bid_amount: number;
    game_id?: string;
    game_type?: string;
    session?: 'open' | 'close';
    open_panna?: string; // For full-sangam and half-sangam
    close_panna?: string; // For full-sangam and half-sangam
}

interface MainMarketBidRequest {
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
    try {
        await dbConnect();
        const body: MainMarketBidRequest = await request.json();
        const { user_id, bids } = body;

        // Validate required fields
        if (!user_id || !bids || !Array.isArray(bids) || bids.length === 0) {
            throw new ApiError('User ID and bids array are required');
        }

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
            const validGameTypes = [
                'single-digit', 'jodi-digit', 'single-panna', 'double-panna',
                'triple-panna', 'half-sangam', 'full-sangam', 'sp-motor',
                'dp-motor', 'sp-dp-tp-motor', 'odd-even', 'two-digit',
                'digit-base-jodi', 'choice-panna', 'red-bracket'
            ];

            if (!bid.game_type || !validGameTypes.includes(bid.game_type)) {
                throw new ApiError('Valid game type is required for each bid');
            }

            // Validate game ID
            if (!bid.game_id) {
                throw new ApiError('Game ID is required for each bid');
            }

            // Session validation based on game type
            if (!['full-sangam', 'jodi-digit', 'red-bracket'].includes(bid.game_type)) {
                if (!bid.session || !['open', 'close'].includes(bid.session)) {
                    throw new ApiError('Valid session is required (open/close) for this game type');
                }
            } else {
                // Remove session for game types that don't need it
                delete bid.session;
            }

            // Validate digit/panna based on game type and session
            if (['single-digit', 'odd-even'].includes(bid.game_type)) {
                if (!bid.digit || !/^[0-9]$/.test(bid.digit)) {
                    throw new ApiError('Single digit (0-9) is required for this game type');
                }
                delete bid.panna;
                delete bid.open_panna;
                delete bid.close_panna;
            }

            if (['jodi-digit', 'red-bracket'].includes(bid.game_type)) {
                if (!bid.digit || !/^[0-9]{2}$/.test(bid.digit)) {
                    throw new ApiError('Two digits (00-99) are required for this game type');
                }
                delete bid.panna;
                delete bid.open_panna;
                delete bid.close_panna;
            }

            if (['digit-base-jodi'].includes(bid.game_type)) {
                if (!bid.digit || !/^[0-9]{2}$/.test(bid.digit)) {
                    throw new ApiError('Two digits (00-99) are required for this game type');
                }
                delete bid.panna;
                delete bid.open_panna;
                delete bid.close_panna;
            }

            if (['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna', 'two-digit'].includes(bid.game_type)) {
                if (!bid.panna || !/^[0-9]{3}$/.test(bid.panna)) {
                    throw new ApiError('Three-digit panna is required for this game type');
                }
                delete bid.digit;
                delete bid.open_panna;
                delete bid.close_panna;
            }

            // Special validation for half-sangam
            if (bid.game_type === 'half-sangam') {
                if (!bid.session) {
                    throw new ApiError('Session is required for half-sangam');
                }
                
                if (bid.session === 'open') {
                    if (!bid.digit || !/^[0-9]$/.test(bid.digit)) {
                        throw new ApiError('Single digit (0-9) is required for half-sangam in open session');
                    }
                    if (!bid.close_panna || !/^[0-9]{3}$/.test(bid.close_panna)) {
                        throw new ApiError('Three-digit close panna is required for half-sangam in open session');
                    }
                    delete bid.panna;
                    delete bid.open_panna;
                } else if (bid.session === 'close') {
                    if (!bid.digit || !/^[0-9]$/.test(bid.digit)) {
                        throw new ApiError('Single digit (0-9) is required for half-sangam in close session');
                    }
                    if (!bid.open_panna || !/^[0-9]{3}$/.test(bid.open_panna)) {
                        throw new ApiError('Three-digit open panna is required for half-sangam in close session');
                    }
                    delete bid.panna;
                    delete bid.close_panna;
                }
            }

            // Special validation for full-sangam
            if (bid.game_type === 'full-sangam') {
                if (!bid.open_panna || !/^[0-9]{3}$/.test(bid.open_panna)) {
                    throw new ApiError('Open panna is required for full-sangam and must be 3 digits');
                }
                if (!bid.close_panna || !/^[0-9]{3}$/.test(bid.close_panna)) {
                    throw new ApiError('Close panna is required for full-sangam and must be 3 digits');
                }
                delete bid.digit;
                delete bid.panna;
                delete bid.session;
            }

            // Check if game exists and is active
            const game = await MainMarketGame.findById(bid.game_id);
            if (!game) {
                throw new ApiError(`Game not found for ID: ${bid.game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Game with ID ${bid.game_id} is inactive`);
            }
        }

        // Check if user exists and has sufficient balance
        const user = await AppUser.findById(user_id);
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

        // Deduct amount from user balance
        user.balance -= totalBidAmount;
        await user.save();

        // Create transaction records
        const transactionIds: Types.ObjectId[] = [];
        for (const bid of bids) {
            const transaction = new Transaction({
                user_id: user_id,
                amount: bid.bid_amount,
                type: 'debit',
                status: 'completed',
                description: `Bid placed on ${bid.game_type} game`
            });

            await transaction.save();
            transactionIds.push(transaction._id);
        }

        // Create the main market bid
        const mainMarketBid = new MainMarketBid({
            user_id: user_id,
            bids: bids,
            total_amount: totalBidAmount
        });

        await mainMarketBid.save();

        return NextResponse.json({
            status: true,
            message: 'Bid placed successfully',
            data: {
                bid_id: mainMarketBid._id,
                total_amount: totalBidAmount,
                new_balance: user.balance,
            }
        });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to place bid';
        return NextResponse.json({ status: false, message: errorMessage });
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
            session: bidSession,
            open_panna,
            close_panna
        } = body;

        // Validate required fields
        if (!bid_id || !user_id) {
            throw new ApiError('Bid ID and User ID are required');
        }

        // Get account settings for min/max bid validation
        const accountSettings = await AccountSetting.findOne();
        const minBidAmount = accountSettings?.min_bid_amount || 0;
        const maxBidAmount = accountSettings?.max_bid_amount || Infinity;

        // Find the main market bid document
        const mainMarketBid = await MainMarketBid.findOne({
            'bids._id': bid_id,
            user_id
        }).session(session);

        if (!mainMarketBid) {
            throw new ApiError('Bid not found or does not belong to this user');
        }

        // For simplicity, we'll only update the first bid in the array
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

            // Check min/max bid amount
            if (bid_amount < minBidAmount) {
                throw new ApiError(`Bid amount must be at least ${minBidAmount}`);
            }

            if (bid_amount > maxBidAmount) {
                throw new ApiError(`Bid amount cannot exceed ${maxBidAmount}`);
            }

            originalBid.bid_amount = bid_amount;
        }

        if (game_type !== undefined) {
            const validGameTypes = [
                'single-digit', 'jodi-digit', 'single-panna', 'double-panna',
                'triple-panna', 'half-sangam', 'full-sangam', 'sp-motor',
                'dp-motor', 'sp-dp-tp-motor', 'odd-even', 'two-digit',
                'digit-base-jodi', 'choice-panna', 'red-bracket'
            ];

            if (!validGameTypes.includes(game_type)) {
                throw new ApiError('Valid game type is required');
            }
            originalBid.game_type = game_type;
        }

        if (game_id !== undefined) {
            // Check if game exists and is active
            const game = await MainMarketGame.findById(game_id).session(session);
            if (!game) {
                throw new ApiError(`Game not found for ID: ${game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Game with ID ${game_id} is inactive`);
            }
            originalBid.game_id = new Types.ObjectId(game_id);
        }

        if (bidSession !== undefined) {
            // Session validation based on game type
            const currentGameType = game_type || originalBid.game_type;

            if (!['full-sangam', 'jodi-digit', 'red-bracket'].includes(currentGameType)) {
                if (!['open', 'close'].includes(bidSession)) {
                    throw new ApiError('Valid session is required (open/close) for this game type');
                }
                originalBid.session = bidSession;
            } else {
                // Remove session for game types that don't need it
                originalBid.session = undefined;
            }
        }

        // Handle digit validation and cleanup
        if (digit !== undefined) {
            const currentGameType = game_type || originalBid.game_type;

            if (['single-digit', 'odd-even'].includes(currentGameType)) {
                if (!digit || !/^[0-9]$/.test(digit)) {
                    throw new ApiError('Single digit (0-9) is required for this game type');
                }
                originalBid.digit = digit;
                // Clean up other fields
                originalBid.panna = undefined;
                originalBid.open_panna = undefined;
                originalBid.close_panna = undefined;
            } else if (['jodi-digit', 'red-bracket', 'digit-base-jodi'].includes(currentGameType)) {
                if (!digit || !/^[0-9]{2}$/.test(digit)) {
                    throw new ApiError('Two digits (00-99) are required for this game type');
                }
                originalBid.digit = digit;
                // Clean up other fields
                originalBid.panna = undefined;
                originalBid.open_panna = undefined;
                originalBid.close_panna = undefined;
            } else if (currentGameType === 'half-sangam') {
                if (!digit || !/^[0-9]$/.test(digit)) {
                    throw new ApiError('Single digit (0-9) is required for half-sangam');
                }
                originalBid.digit = digit;
            } else {
                originalBid.digit = undefined;
            }
        }

        // Handle panna validation and cleanup
        if (panna !== undefined) {
            const currentGameType = game_type || originalBid.game_type;
            const pannaGames = [
                'single-panna', 'double-panna', 'triple-panna', 
                'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 
                'choice-panna', 'two-digit'
            ];

            if (pannaGames.includes(currentGameType)) {
                if (!panna || !/^[0-9]{3}$/.test(panna)) {
                    throw new ApiError('Three-digit panna is required for this game type');
                }
                originalBid.panna = panna;
                // Clean up other fields
                originalBid.digit = undefined;
                originalBid.open_panna = undefined;
                originalBid.close_panna = undefined;
            } else {
                originalBid.panna = undefined;
            }
        }

        // Handle open_panna for half-sangam (close session) and full-sangam
        if (open_panna !== undefined) {
            const currentGameType = game_type || originalBid.game_type;
            const currentSession = bidSession || originalBid.session;

            if (currentGameType === 'full-sangam') {
                if (!open_panna || !/^[0-9]{3}$/.test(open_panna)) {
                    throw new ApiError('Open panna is required for full-sangam and must be 3 digits');
                }
                originalBid.open_panna = open_panna;
                // Clean up other fields
                originalBid.digit = undefined;
                originalBid.panna = undefined;
            } else if (currentGameType === 'half-sangam' && currentSession === 'close') {
                if (!open_panna || !/^[0-9]{3}$/.test(open_panna)) {
                    throw new ApiError('Open panna is required for half-sangam in close session and must be 3 digits');
                }
                originalBid.open_panna = open_panna;
                // Clean up other fields
                originalBid.panna = undefined;
                originalBid.close_panna = undefined;
            } else {
                originalBid.open_panna = undefined;
            }
        }

        // Handle close_panna for half-sangam (open session) and full-sangam
        if (close_panna !== undefined) {
            const currentGameType = game_type || originalBid.game_type;
            const currentSession = bidSession || originalBid.session;

            if (currentGameType === 'full-sangam') {
                if (!close_panna || !/^[0-9]{3}$/.test(close_panna)) {
                    throw new ApiError('Close panna is required for full-sangam and must be 3 digits');
                }
                originalBid.close_panna = close_panna;
                // Clean up other fields
                originalBid.digit = undefined;
                originalBid.panna = undefined;
            } else if (currentGameType === 'half-sangam' && currentSession === 'open') {
                if (!close_panna || !/^[0-9]{3}$/.test(close_panna)) {
                    throw new ApiError('Close panna is required for half-sangam in open session and must be 3 digits');
                }
                originalBid.close_panna = close_panna;
                // Clean up other fields
                originalBid.panna = undefined;
                originalBid.open_panna = undefined;
            } else {
                originalBid.close_panna = undefined;
            }
        }

        // Final validation for specific game types
        const currentGameType = game_type || originalBid.game_type;
        const currentSession = bidSession || originalBid.session;

        // Validate half-sangam requirements
        if (currentGameType === 'half-sangam') {
            if (!currentSession) {
                throw new ApiError('Session is required for half-sangam');
            }

            if (currentSession === 'open') {
                if (!originalBid.digit || !/^[0-9]$/.test(originalBid.digit)) {
                    throw new ApiError('Single digit (0-9) is required for half-sangam in open session');
                }
                if (!originalBid.close_panna || !/^[0-9]{3}$/.test(originalBid.close_panna)) {
                    throw new ApiError('Close panna is required for half-sangam in open session and must be 3 digits');
                }
                // Clean up other fields
                originalBid.panna = undefined;
                originalBid.open_panna = undefined;
            } else if (currentSession === 'close') {
                if (!originalBid.digit || !/^[0-9]$/.test(originalBid.digit)) {
                    throw new ApiError('Single digit (0-9) is required for half-sangam in close session');
                }
                if (!originalBid.open_panna || !/^[0-9]{3}$/.test(originalBid.open_panna)) {
                    throw new ApiError('Open panna is required for half-sangam in close session and must be 3 digits');
                }
                // Clean up other fields
                originalBid.panna = undefined;
                originalBid.close_panna = undefined;
            }
        }

        // Final validation for full-sangam
        if (currentGameType === 'full-sangam') {
            if (!originalBid.open_panna || !/^[0-9]{3}$/.test(originalBid.open_panna)) {
                throw new ApiError('Open panna is required for full-sangam and must be 3 digits');
            }
            if (!originalBid.close_panna || !/^[0-9]{3}$/.test(originalBid.close_panna)) {
                throw new ApiError('Close panna is required for full-sangam and must be 3 digits');
            }
            // Clean up other fields
            originalBid.digit = undefined;
            originalBid.panna = undefined;
            originalBid.session = undefined;
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
        const userId = searchParams.get('user_id');
        const session = searchParams.get('session');

        // Build filter object dynamically
        const filter: {
            created_at?: {
                $gte?: Date;
                $lte?: Date;
            };
            user_id?: Types.ObjectId;
        } = {};

        // Date filtering
        if (startDate || endDate) {
            filter.created_at = {};
            if (startDate) {
                filter.created_at.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
            }
            if (endDate) {
                filter.created_at.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
            }
        }

        // User ID filtering
        if (userId) {
            filter.user_id = new mongoose.Types.ObjectId(userId);
        }

        // Add match stage for bids array filtering
        const bidsMatchStage: {
            'bids.game_id'?: Types.ObjectId;
            'bids.game_type'?: string;
            'bids.session'?: string;
        } = {};

        // Game ID filtering
        if (gameId) {
            bidsMatchStage['bids.game_id'] = new mongoose.Types.ObjectId(gameId);
        }

        // Game type filtering
        if (gameType) {
            bidsMatchStage['bids.game_type'] = gameType;
        }

        // Session filtering
        if (session) {
            bidsMatchStage['bids.session'] = session;
        }

        // Build aggregation pipeline
        const pipeline: PipelineStage[] = [];

        // First, match the main document filters
        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
        }

        // Then unwind the bids array
        pipeline.push({ $unwind: '$bids' });

        // Then match the bid-specific filters
        if (Object.keys(bidsMatchStage).length > 0) {
            pipeline.push({ $match: bidsMatchStage });
        }

        // Add lookups and projections
        pipeline.push(
            {
                $lookup: {
                    from: 'mainmarketgames',
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
                    open_panna: '$bids.open_panna',
                    close_panna: '$bids.close_panna',
                    bid_amount: '$bids.bid_amount',
                    game_id: '$bids.game_id',
                    game_name: { $arrayElemAt: ['$game_info.game_name', 0] },
                    game_type: '$bids.game_type',
                    session: '$bids.session',
                    created_at: 1,
                    updated_at: 1
                }
            },
            { $sort: { created_at: -1 } }
        );

        // Execute query with aggregation pipeline
        const bids = await MainMarketBid.aggregate(pipeline);

        return NextResponse.json({
            status: true,
            data: bids
        });

    } catch (error: unknown) {
        console.error('Error fetching bids:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bids';
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: 500 }
        );
    }
}
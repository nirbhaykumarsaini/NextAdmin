import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import ApiError from '@/lib/errors/APiError';
import MainMarketGame from '@/models/MainMarketGame';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import mongoose, { Types } from 'mongoose';

interface BidRequest {
    bid_id?: string;
    user_id?: string;
    digit?: string;
    panna?: string;
    bid_amount: number;
    game_id?: string;
    game_type?: string;
    session?: 'open' | 'close';
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await dbConnect();
        const body: MainMarketBidRequest = await request.json();
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
            if (!['full-sangam', 'jodi-digit', 'red-bracket', 'odd-even'].includes(bid.game_type)) {
                if (!bid.session || !['open', 'close'].includes(bid.session)) {
                    throw new ApiError('Valid session is required (open/close) for this game type');
                }
            } else {
                // Remove session for game types that don't need it
                delete bid.session;
            }

            // Validate digit/panna based on game type and session
            if (['single-digit', 'jodi-digit', 'two-digit', 'digit-base-jodi', 'red-bracket'].includes(bid.game_type)) {
                if (!bid.digit) {
                    throw new ApiError('Digit is required for this game type');
                }
                // Remove panna if it exists for digit-based games
                delete bid.panna;
            }

            if (['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna'].includes(bid.game_type)) {
                if (!bid.panna) {
                    throw new ApiError('Panna is required for this game type');
                }
                // Remove digit if it exists for panna-based games
                delete bid.digit;
            }

            // Special validation for half-sangam and full-sangam
            if (bid.game_type === 'half-sangam') {
                if (bid.session === 'close' && !bid.panna) {
                    throw new ApiError('Panna is required for half-sangam in close session');
                }
                if (bid.session === 'open' && !bid.digit) {
                    throw new ApiError('Digit is required for half-sangam in open session');
                }
            }

            if (bid.game_type === 'full-sangam') {
                if (!bid.panna || !bid.digit) {
                    throw new ApiError('Both digit and panna are required for full-sangam');
                }
            }

            // Check if game exists and is active
            const game = await MainMarketGame.findById(bid.game_id).session(session);
            if (!game) {
                throw new ApiError(`Game not found for ID: ${bid.game_id}`);
            }
            if (!game.is_active) {
                throw new ApiError(`Game with ID ${bid.game_id} is inactive`);
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

        if (user.balance === 0) {
            throw new ApiError('Insufficient balance');
        }

        // Deduct amount from user balance
        user.balance -= totalBidAmount;
        await user.save({ session });

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

            await transaction.save({ session });
            transactionIds.push(transaction._id);
        }

        // Create the main market bid
        const mainMarketBid = new MainMarketBid({
            user_id: user_id,
            bids: bids,
            total_amount: totalBidAmount
        });

        await mainMarketBid.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();


        return NextResponse.json({
            status: true,
            message: 'Bid placed successfully',
            data: {
                bid_id: mainMarketBid._id,
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
            session: bidSession
        } = body;

        // Validate required fields
        if (!bid_id || !user_id) {
            throw new ApiError('Bid ID and User ID are required');
        }

        // Find the main market bid document
        const mainMarketBid = await MainMarketBid.findOne({
            _id: bid_id,
            user_id
        }).session(session);

        if (!mainMarketBid) {
            throw new ApiError('Bid not found or does not belong to this user');
        }

        // For simplicity, we'll only update the first bid in the array
        // You might want to extend this to handle multiple bids if needed
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

            if (!['full-sangam', 'jodi-digit', 'red-bracket', 'odd-even'].includes(currentGameType)) {
                if (!['open', 'close'].includes(bidSession)) {
                    throw new ApiError('Valid session is required (open/close) for this game type');
                }
                originalBid.session = bidSession;
            } else {
                // Remove session for game types that don't need it
                originalBid.session = undefined;
            }
        }

        if (digit !== undefined) {
            const currentGameType = game_type || originalBid.game_type;

            if (['single-digit', 'jodi-digit', 'two-digit', 'digit-base-jodi', 'red-bracket'].includes(currentGameType)) {
                if (!digit) {
                    throw new ApiError('Digit is required for this game type');
                }
                originalBid.digit = digit;
                // Remove panna for digit-based games
                originalBid.panna = undefined;
            } else {
                originalBid.digit = undefined;
            }
        }

        if (panna !== undefined) {
            const currentGameType = game_type || originalBid.game_type;

            if (['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna'].includes(currentGameType)) {
                if (!panna) {
                    throw new ApiError('Panna is required for this game type');
                }
                originalBid.panna = panna;
                // Remove digit for panna-based games
                originalBid.digit = undefined;
            } else {
                originalBid.panna = undefined;
            }
        }

        // Special validation for half-sangam and full-sangam
        const currentGameType = game_type || originalBid.game_type;
        const currentSession = bidSession || originalBid.session;

        if (currentGameType === 'half-sangam') {
            if (currentSession === 'close' && !originalBid.panna) {
                throw new ApiError('Panna is required for half-sangam in close session');
            }
            if (currentSession === 'open' && !originalBid.digit) {
                throw new ApiError('Digit is required for half-sangam in open session');
            }
        }

        if (currentGameType === 'full-sangam') {
            if (!originalBid.panna || !originalBid.digit) {
                throw new ApiError('Both digit and panna are required for full-sangam');
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
    const bids = await MainMarketBid.aggregate([
      { $unwind: '$bids' },
      { $match: filter },
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
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
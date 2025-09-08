import { NextRequest, NextResponse } from 'next/server';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import { Types } from 'mongoose';
import MainMarketWinner from '@/models/MainMarketWinner';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';

interface SessionResult {
  panna: string;
  digit: string;
  _id: Types.ObjectId;
}

interface GroupedResult {
  result_date: string;
  game_name: string;
  openSession: SessionResult | null;
  closeSession: SessionResult | null;
}

// Interface for the MainMarketResult document
interface MainMarketResultDocument {
  result_date: string;
  game_id: { game_name: string };
  session: string;
  panna: string;
  digit: string;
  _id: Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

interface WinnerData {
  user_id: Types.ObjectId;
  user: string;
  game: string;
  game_type: string;
  amount: number;
  winning_amount: number;
  session: string;
  digit: string;
  panna: string;
  open_panna: string;
  close_panna: string;
}

interface ProcessedWinner {
  user_id: Types.ObjectId;
  user: string;
  game_name: string;
  game_type: string;
  panna: string;
  open_panna: string;
  close_panna: string;
  digit: string;
  session: string;
  winning_amount: number;
  bid_amount: number;
}

// CREATE a new result
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { result_date, game_id, session, panna, digit, winners } = body;
    console.log("winners,", winners)

    // Validate required fields
    if (!result_date) {
      throw new ApiError('Date is required');
    }
    if (!game_id) {
      throw new ApiError('Game id is required');
    }
    if (!session) {
      throw new ApiError('Session is required');
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
    const existingResult = await MainMarketResult.findOne({
      game_id,
      result_date,
      session
    });

    if (existingResult) {
      throw new ApiError('Result already exists for this date, game, and session');
    }

    // Create the new result
    const newResult = await MainMarketResult.create({
      result_date,
      game_id,
      session,
      panna,
      digit
    });

    // Process winners if provided
    const processedWinners: ProcessedWinner[] = [];

    if (winners.length > 0) {
      for (const winner of winners as WinnerData[]) {
        const { user, user_id, game, game_type, amount, winning_amount, session: winnerSession, digit: winnerDigit, panna: winnerPanna, close_panna:closewinnerPanna, open_panna:openwinnerPanna } = winner;

        // Validate winner data
        if (!user || winning_amount === undefined) {
          console.warn('Invalid winner data:', winner);
          continue;
        }

        try {
          // Find the user by username/name since your data has 'user' not 'user_id'
          const userDoc = await AppUser.findOne({ _id: user_id });
          if (!userDoc) {
            console.warn(`User not found`);
            continue;
          }

          // Create transaction for the win
          await Transaction.create({
            user_id: userDoc._id,
            type: 'credit',
            amount: winning_amount,
            description: `Win from ${game_type} ${winnerSession} session on ${result_date}`,
            status: 'completed'
          });

          // Update user balance
          await AppUser.findByIdAndUpdate(
            userDoc._id,
            { $inc: { balance: winning_amount } },
            { new: true }
          );

          // Add to processed winners array
          processedWinners.push({
            user,
            user_id,
            game_name: game,
            game_type,
            panna: winnerPanna,
            open_panna:openwinnerPanna,
            close_panna:closewinnerPanna,
            digit: winnerDigit,
            session: winnerSession,
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
        await MainMarketWinner.create({
          result_date: new Date(result_date),
          winners: processedWinners
        });
      }
    }

    return NextResponse.json({
      status: true,
      message: `Result created successfully with ${processedWinners.length} winners`,
      result: newResult // Now using the newResult variable
    });

  } catch (error: unknown) {
    console.error('Error creating result:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create result';
    return NextResponse.json(
      { status: false, message: errorMessage });
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

    // Get all results with proper typing
    const results = await MainMarketResult.find(query).sort({ result_date: -1, createdAt: -1 }).populate('game_id', 'game_name') as unknown as MainMarketResultDocument[];

    // Group results by date and game
    const groupedResults = results.reduce((acc: Record<string, GroupedResult>, result: MainMarketResultDocument) => {
      const key = `${result.result_date}-${result.game_id.game_name}`;

      if (!acc[key]) {
        acc[key] = {
          result_date: result.result_date,
          game_name: result.game_id.game_name,
          openSession: null,
          closeSession: null
        };
      }

      if (result.session === 'Open') {
        acc[key].openSession = {
          panna: result.panna,
          digit: result.digit,
          _id: result._id
        };
      } else if (result.session === 'Close') {
        acc[key].closeSession = {
          panna: result.panna,
          digit: result.digit,
          _id: result._id
        };
      }

      return acc;
    }, {});

    // Convert to array
    const groupedResultsArray = Object.values(groupedResults);

    return NextResponse.json({
      status: true,
      data: groupedResultsArray
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve results';
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
    const result = await MainMarketResult.findByIdAndDelete(id);

    if (!result) {
      throw new ApiError('Result not found');
    }

    // Get all results grouped by date and game
    await MainMarketResult.find().sort({ result_date: -1, createdAt: -1 });

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
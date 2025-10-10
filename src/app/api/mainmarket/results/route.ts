import { NextRequest, NextResponse } from 'next/server';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import mongoose, { Types } from 'mongoose';
import MainMarketWinner from '@/models/MainMarketWinner';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import { parseDDMMYYYY } from '@/utils/date';
import MainMarketGame from '@/models/MainMarketGame';

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
  _id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  user?: string;
  game_name?: string;
  game_type?: string;
  panna?: string;
  open_panna?: string;
  close_panna?: string;
  digit?: string;
  session?: string;
  winning_amount?: number;
  bid_amount?: number;
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
        const { user, user_id, game, game_type, amount, winning_amount, session: winnerSession, digit: winnerDigit, panna: winnerPanna, close_panna: closewinnerPanna, open_panna: openwinnerPanna } = winner;

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
            open_panna: openwinnerPanna,
            close_panna: closewinnerPanna,
            digit: winnerDigit,
            session: winnerSession || "close",
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
          result_date: parseDDMMYYYY(result_date),
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
    const results = await MainMarketResult.find(query).sort({ result_date: -1, created_at: -1 }).populate('game_id', 'game_name') as unknown as MainMarketResultDocument[];

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

      if (result.session === 'open') {
        acc[key].openSession = {
          panna: result.panna,
          digit: result.digit,
          _id: result._id
        };
      } else if (result.session === 'close') {
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

async function deleteMainMarketResult(resultId: string, sessionType: 'open' | 'close') {
  if (!resultId || !mongoose.Types.ObjectId.isValid(resultId)) {
    throw new ApiError("Invalid Result ID");
  }

  const result = await MainMarketResult.findById(resultId);
  if (!result) throw new ApiError("Result not found");

  const game = await MainMarketGame.findById(result.game_id);
  if (!game) throw new ApiError("Game not found");

  const normalizedSession = sessionType.trim()?.toLowerCase();

  // Find ALL Winner documents for this game_id and result_date (date-only match)
  const startOfDay = new Date(result.result_date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(result.result_date);
  endOfDay.setHours(23, 59, 59, 999);

  const winnerDocs = await MainMarketWinner.find({
    result_date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    "winners.game_name": game.game_name // Adjust field name as per your MainMarketGame schema
  });

  // Process winners and revert balances
  for (const winDoc of winnerDocs) {
    // Filter winners based on session type - FIXED: declare as array
    let winnersToProcess: ProcessedWinner[] = [];

    if (normalizedSession === "open") {
      // For Open session deletion: process all Open winners EXCEPT half-sangam
      winnersToProcess = winDoc.winners.filter((w: ProcessedWinner) =>
        w.session?.toLowerCase() === "open" &&
        w.game_name === game.game_name &&
        w.game_type !== "half-sangam" // EXCLUDE half-sangam
      ) as ProcessedWinner[];
      console.log(`Open session deletion: Processing ${winnersToProcess.length} winners (excluding half-sangam)`);

    } else if (normalizedSession === "close") {
      // For Close session deletion: process ALL Close winners + half-sangam Open winners
      const closeSessionWinners = winDoc.winners.filter((w: ProcessedWinner) =>
        w.session?.toLowerCase() === "close" &&
        w.game_name === game.game_name
      ) as ProcessedWinner[];

      const halfSangamOpenWinners = winDoc.winners.filter((w: ProcessedWinner) =>
        w.game_type === "half-sangam" &&
        w.session?.toLowerCase() === "open" &&
        w.game_name === game.game_name
      ) as ProcessedWinner[];

      winnersToProcess = [...closeSessionWinners, ...halfSangamOpenWinners];
      console.log(`Close session deletion: Processing ${winnersToProcess.length} winners (${closeSessionWinners.length} Close + ${halfSangamOpenWinners.length} half-sangam Open)`);
    }

    // Process the filtered winners (revert amounts and delete transactions)
    for (const winner of winnersToProcess) {
      // Revert user's win amount
      const user = await AppUser.findById(winner.user_id);
      if (user) {
        user.balance = Math.max(0, user.balance - (winner.winning_amount || 0));
        await user.save();
        console.log(`Reverted ${winner.winning_amount} from user ${winner.user_id} for ${winner.game_type} (${winner.session})`);
      }

      // Delete related transactions (search by description or amount)
      await Transaction.deleteMany({
        user_id: winner.user_id,
        amount: winner.winning_amount,
        type: 'credit',
        status: 'completed',
        description: {
          $regex: winner.game_type || '',
          $options: 'i'
        }
      });
      console.log(`Deleted transactions for user ${winner.user_id} with amount ${winner.winning_amount}`);
    }

    // Remove processed winners from winner document
    winDoc.winners = winDoc.winners.filter((w: ProcessedWinner) => {
      const isProcessed = winnersToProcess.some(processed =>
        processed._id?.toString() === w._id?.toString()
      );
      return !isProcessed; // Keep winners that were NOT processed
    });

    if (winDoc.winners.length === 0) {
      // If no winners left, delete the document
      await MainMarketWinner.findByIdAndDelete(winDoc._id);
      console.log(`Deleted empty winner document: ${winDoc._id}`);
    } else {
      // Otherwise, update the document
      await winDoc.save();
      console.log(`Updated winner document: ${winDoc._id}, remaining winners: ${winDoc.winners.length}`);
    }
  }

  // Delete the specific result
  await MainMarketResult.deleteOne({
    _id: resultId,
    session: sessionType
  });

  // Check if other session exists for the same game and date
  const remainingResult = await MainMarketResult.findOne({
    game_id: result.game_id,
    result_date: result.result_date,
    session: normalizedSession === "open" ? "close" : "open"
  });

  // If no other session exists, you might want to delete related data
  if (!remainingResult) {
    console.log(`No ${normalizedSession === "open" ? "close" : "open"} session found for game ${game.game_name} on ${result.result_date}`);
    // Additional cleanup can be done here if needed
  }

  return {
    status: true,
    message: `${sessionType} session result deleted successfully`
  };
}

// DELETE a result by ID
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sessionType = searchParams.get('sessionType') as 'open' | 'close';

    if (!id) {
      throw new ApiError('Result ID is required');
    }

    if (!sessionType || !['open', 'close'].includes(sessionType)) {
      throw new ApiError('Valid sessionType (open/close) is required');
    }

    // Use the delete function with session type
    const result = await deleteMainMarketResult(id, sessionType);

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Error deleting result:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete result';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: error instanceof ApiError ? error.statusCode : 500 }
    );
  }
}


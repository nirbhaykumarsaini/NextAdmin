import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import mongoose from 'mongoose';
import MainMarketRate from '@/models/MainmarketRate';

// Helper function to calculate winning amount
function calculateWinningAmount(gameType: string, bidAmount: number, gameRates: any): number {
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
        { status: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate session is either "open" or "close"
    const sessionLower = session.toLowerCase();
    if (!["open", "close"].includes(sessionLower)) {
      return NextResponse.json(
        { status: false, message: 'Session must be either "open" or "close"' },
        { status: 400 }
      );
    }

    // Validate panna is 3 digits
    if (String(panna).length !== 3) {
      return NextResponse.json(
        { status: false, message: 'Panna must be 3 digits' },
        { status: 400 }
      );
    }

    // Validate digit is single digit
    if (String(digit).length !== 1) {
      return NextResponse.json(
        { status: false, message: 'Digit must be single digit' },
        { status: 400 }
      );
    }

    // Get game rates
    const gameRates = await MainMarketRate.findOne({});
    if (!gameRates) {
      return NextResponse.json(
        { status: false, message: 'Game rates not configured' },
        { status: 400 }
      );
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
      .populate('bids.game_id', 'game_name');

    if (!bids || bids.length === 0) {
      return NextResponse.json({
        status: true,
        message: 'No bids found for the specified criteria',
        data: []
      });
    }

    // Calculate sum of current panna digits
    const pannaSum = String(panna).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    const pannaDigit = pannaSum > 9 ? String(pannaSum).slice(-1) : pannaSum;

    // Filter winning bids
    const winningBids: any[] = [];

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

        // Check based on game type
        switch (bid.game_type) {
          case 'full-sangam':
            // Only check in close session
            if (sessionLower !== 'close') return;
            
            // For full-sangam, check if panna matches
            if (bid.panna === panna) {
              const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
              winningBids.push({
                _id: mainBid._id,
                user: mainBid.user_id,
                created_at: mainBid.created_at,
                game_type: bid.game_type,
                session: bid.session,
                game: bid.game_id,
                amount: bid.bid_amount,
                winning_amount: winningAmount,
                panna: bid.panna
              });
            }
            break;

          case 'jodi-digit':
          case 'red-bracket':
            // Only check in close session
            if (sessionLower !== 'close') return;
            
            // For jodi-digit and red-bracket, check if digit matches
            if (bid.digit === digit) {
              const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
              winningBids.push({
                _id: mainBid._id,
                user: mainBid.user_id.name,
                created_at: mainBid.created_at,
                game_type: bid.game_type,
                session: bid.session,
                game: bid.game_id.game_name,
                amount: bid.bid_amount,
                winning_amount: winningAmount,
                digit: bid.digit
              });
            }
            break;

          case 'half-sangam':
            // For half-sangam, check if panna matches
            if (bid.panna === panna) {
              const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
              winningBids.push({
                _id: mainBid._id,
                user: mainBid.user_id,
                created_at: mainBid.created_at,
                game_type: bid.game_type,
                session: bid.session,
                game: bid.game_id,
                amount: bid.bid_amount,
                winning_amount: winningAmount,
                panna: bid.panna
              });
            }
            break;

          case 'single-digit':
          case 'odd-even':
          case 'digit-base-jodi':
            // For these games, just check if digit matches
            if (bid.digit === digit) {
              const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
              winningBids.push({
                _id: mainBid._id,
                user: mainBid.user_id.name,
                created_at: mainBid.created_at,
                game_type: bid.game_type,
                session: bid.session,
                game: bid.game_id.game_name,
                amount: bid.bid_amount,
                winning_amount: winningAmount,
                digit: bid.digit
              });
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
              const winningAmount = calculateWinningAmount(bid.game_type, bid.bid_amount, gameRates);
              winningBids.push({
                _id: mainBid._id,
                user: mainBid.user_id.name,
                created_at: mainBid.created_at,
                game_type: bid.game_type,
                session: bid.session,
                game: bid.game_id.game_name,
                amount: bid.bid_amount,
                winning_amount: winningAmount,
                panna: bid.panna
              });
            }
            break;

          default:
            break;
        }
      });
    });

    return NextResponse.json({
      status: true,
      message: 'Winners retrieved successfully',
      data: winningBids
    });
    
  } catch (error: unknown) {
    console.error('Error checking winners:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check winners';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
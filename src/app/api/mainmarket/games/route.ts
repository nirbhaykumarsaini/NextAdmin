import { NextRequest, NextResponse } from 'next/server';
import MainMarketGame from '@/models/MainMarketGame';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import { format } from 'date-fns';

connectDB();

// GET - Get today's market data with results
export async function GET() {
  try {
    // Get current day name and formatted date
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayDayName = daysOfWeek[today.getDay()];
    const todayDate = format(today, 'dd-MM-yyyy');

    // Find all active games
    const games = await MainMarketGame.find({ is_active: true });
    
    // Get today's results for all games
    const todayResults = await MainMarketResult.find({
      result_date: todayDate
    }).populate('game_id', 'game_name');

    // Create a map for quick lookup of results by game_id
    const resultsMap = new Map();
    todayResults.forEach(result => {
      const gameId = result.game_id._id.toString();
      if (!resultsMap.has(gameId)) {
        resultsMap.set(gameId, {});
      }
      resultsMap.get(gameId)[result.session.toLowerCase()] = {
        panna: result.panna,
        digit: result.digit
      };
    });

    // Combine game data with today's timing and results
    const todayData = games.map(game => {
      const todayDay = game.days.find((day: { day: string; }) => day.day === todayDayName);
      const gameResults = resultsMap.get(game._id.toString()) || {};

      return {
        game_id: game._id,
        game_name: game.game_name,
        is_active:game.is_active,
        market_timing: todayDay ? {
          open_time: todayDay.open_time,
          close_time: todayDay.close_time,
          market_status: todayDay.market_status
        } : null,
        results: {
          open: gameResults.open || "*** *",
          close: gameResults.close || "* ***"
        }
      };
    });

    return NextResponse.json({
      status: true,
      data: todayData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch today\'s market data';
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}
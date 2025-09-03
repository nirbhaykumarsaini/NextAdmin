import { NextRequest, NextResponse } from 'next/server';
import GalidisawarGame from '@/models/GalidisawarGame';
import GalidisawarResult from '@/models/GalidisawarResult';
import connectDB from '@/config/db';
import { format } from 'date-fns';

connectDB();

// GET - Get today's market data with results
export async function GET(request: NextRequest) {
  try {
    // Get current day name and formatted date
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayDayName = daysOfWeek[today.getDay()];
    const todayDate = format(today, 'dd-MM-yyyy');

    // Find all active games
    const games = await GalidisawarGame.find({ is_active: true });
    
    // Get today's results for all games
    const todayResults = await GalidisawarResult.find({
      result_date: todayDate
    }).populate('game_id', 'game_name');

    // Create a map for quick lookup of results by game_id
    const resultsMap = new Map();
    todayResults.forEach(result => {
      const gameId = result.game_id._id.toString();
      resultsMap.set(gameId, {
        digit: result.digit // Removed panna field since it doesn't exist in your schema
      });
    });

    // Combine game data with today's timing and results
    const todayData = games.map(game => {
      const todayDay = game.days.find((day: { day: string; }) => day.day === todayDayName);
      const gameResult = resultsMap.get(game._id.toString()) || { digit: "**" }; // Adjusted default value

      return {
        game_id: game._id,
        game_name: game.game_name,
        is_active: game.is_active,
        market_timing: todayDay ? {
          open_time: todayDay.open_time,
          market_status: todayDay.market_status
        } : null,
        result: gameResult
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
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import MainMarketGame from '@/models/MainMarketGame';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import { format } from 'date-fns';

connectDB();

// Function to convert time to AM/PM format
const convertToAMPM = (time: string): string => {
  try {
    // Check if time is already in AM/PM format
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      return time;
    }

    // Split the time by colon
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    
    // Determine AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const hours12 = hours % 12 || 12;
    
    // Format minutes with leading zero if needed
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${hours12}:${formattedMinutes} ${period}`;
  } catch (error) {
    // Return original time if conversion fails
    return time;
  }
};

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
      // Check if game_id is populated (object) or just an ObjectId (string)
      const gameId = typeof result.game_id === 'object' && result.game_id !== null 
        ? (result.game_id as { _id: { toString: () => string } })._id.toString() 
        : result.game_id;
      
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

      // Convert times to AM/PM format
      const formattedOpenTime = todayDay ? convertToAMPM(todayDay.open_time) : null;
      const formattedCloseTime = todayDay ? convertToAMPM(todayDay.close_time) : null;

      return {
        game_id: game._id,
        game_name: game.game_name,
        is_active: game.is_active,
        market_timing: todayDay ? {
          open_time: formattedOpenTime,
          close_time: formattedCloseTime,
          market_status: todayDay.market_status
        } : null,
        results: {
          open: gameResults.open || { panna: "***", digit: "*" },
          close: gameResults.close || { panna: "*", digit: "***" }
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
      { status: 500 } // Added status code
    );
  }
}
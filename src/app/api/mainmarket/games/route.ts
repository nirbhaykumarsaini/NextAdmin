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

// Function to convert time to 24-hour format for comparison
const convertTo24Hour = (time: string): number => {
  try {
    // If already in 24-hour format (HH:MM)
    if (time.includes(':') && !time.toLowerCase().includes('am') && !time.toLowerCase().includes('pm')) {
      const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
      return hours * 60 + minutes;
    }

    // For AM/PM format
    const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const period = timeParts[3].toUpperCase();

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    }

    return Infinity; // Return high value if conversion fails
  } catch (error) {
    return Infinity;
  }
};

// Function to get next available time for a game
const getNextGameTime = (game: any, todayDay: any): number => {
  if (!todayDay) return Infinity;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const openTime = convertTo24Hour(todayDay.open_time);
  const closeTime = convertTo24Hour(todayDay.close_time);

  // If market is open, next time is current time (prioritize open markets)
  if (todayDay.market_status === 'open') {
    return currentTime;
  }

  // If open time is in future, return open time
  if (openTime > currentTime) {
    return openTime;
  }

  // If close time is in future, return close time
  if (closeTime > currentTime) {
    return closeTime;
  }

  // If both times have passed, return Infinity (will be sorted last)
  return Infinity;
};

// GET - Get today's market data with results, sorted by next available time
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

      // Calculate next game time for sorting
      const nextGameTime = getNextGameTime(game, todayDay);

      return {
        game_id: game._id,
        game_name: game.game_name,
        is_active: game.is_active,
        market_timing: todayDay ? {
          open_time: formattedOpenTime,
          close_time: formattedCloseTime,
          market_status: todayDay.market_status,
          raw_open_time: todayDay.open_time, // Keep original for sorting
          raw_close_time: todayDay.close_time // Keep original for sorting
        } : null,
        results: {
          open: gameResults.open || { panna: "***", digit: "*" },
          close: gameResults.close || { panna: "*", digit: "***" }
        },
        next_game_time: nextGameTime,
        sort_priority: todayDay?.market_status === 'open' ? 0 : 
                      nextGameTime < Infinity ? 1 : 2
      };
    });

    // Sort games by:
    // 1. Currently open markets first (highest priority)
    // 2. Games with nearest upcoming time next
    // 3. Games that have already ended last
    const sortedData = todayData.sort((a, b) => {
      // First, sort by priority (open markets first)
      if (a.sort_priority !== b.sort_priority) {
        return a.sort_priority - b.sort_priority;
      }

      // If both are open or both have upcoming times, sort by time
      if (a.next_game_time !== b.next_game_time) {
        return a.next_game_time - b.next_game_time;
      }

      // If times are equal, sort by game name
      return a.game_name.localeCompare(b.game_name);
    });

    // Remove temporary sorting fields from response
    const finalData = sortedData.map(({ next_game_time, sort_priority, ...game }) => game);

    return NextResponse.json({
      status: true,
      data: finalData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch today\'s market data';
    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}
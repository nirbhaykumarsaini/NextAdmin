import { NextResponse } from 'next/server';
import MainMarketGame from '@/models/MainMarketGame';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import { format } from 'date-fns';

connectDB();

// Interface for time conversion result
interface TimeConversionResult {
  formattedTime: string;
  period: string;
  sortableTime: string;
}

// Interface for day object
interface GameDay {
  day: string;
  open_time: string;
  close_time: string;
  market_status: string;
}

// Interface for game result
interface GameResult {
  panna: string;
  digit: string;
}

// Interface for market timing
interface MarketTiming {
  open_time: string | null;
  close_time: string | null;
  market_status: string;
  period: string;
  sortableTime: string;
}

// Interface for the final game data
interface TodayGameData {
  game_id: string;
  game_name: string;
  is_active: boolean;
  market_timing: MarketTiming | null;
  results: {
    open: GameResult;
    close: GameResult;
  };
}

// Function to convert time to AM/PM format and extract period for sorting
const convertToAMPM = (time: string): TimeConversionResult => {
  try {
    // Check if time is already in AM/PM format
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      const timeParts = time.split(' ');
      const [hours, minutes] = timeParts[0].split(':').map(part => parseInt(part, 10));
      const period = timeParts[1]?.toUpperCase() || 'AM';
      
      // Create sortable time (convert to 24-hour format for sorting)
      let sortableHours = hours;
      if (period === 'PM' && hours !== 12) {
        sortableHours += 12;
      } else if (period === 'AM' && hours === 12) {
        sortableHours = 0;
      }
      
      const sortableTime = `${sortableHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        formattedTime: time,
        period,
        sortableTime
      };
    }

    // Split the time by colon (24-hour format)
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    
    // Determine AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const hours12 = hours % 12 || 12;
    
    // Format minutes with leading zero if needed
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    const formattedTime = `${hours12}:${formattedMinutes} ${period}`;
    
    // Create sortable time (24-hour format)
    const sortableTime = `${hours.toString().padStart(2, '0')}:${formattedMinutes}`;
    
    return {
      formattedTime,
      period,
      sortableTime
    };
  } catch (error) {
    // Return original time if conversion fails
    return {
      formattedTime: time,
      period: 'AM',
      sortableTime: '00:00'
    };
  }
};

// Function to sort games by timing (AM first, then PM)
const sortGamesByTiming = (games: TodayGameData[]): TodayGameData[] => {
  return games.sort((a, b) => {
    // If either game has no market timing, put them at the end
    if (!a.market_timing || !b.market_timing) {
      if (!a.market_timing && !b.market_timing) return 0;
      return !a.market_timing ? 1 : -1;
    }

    // Compare by period first (AM before PM)
    const aPeriod = a.market_timing.period || 'AM';
    const bPeriod = b.market_timing.period || 'AM';
    
    if (aPeriod !== bPeriod) {
      return aPeriod === 'AM' ? -1 : 1;
    }

    // If same period, compare by sortable time
    return a.market_timing.sortableTime.localeCompare(b.market_timing.sortableTime);
  });
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
      
      const sessionResults = resultsMap.get(gameId);
      if (sessionResults && result.session) {
        sessionResults[result.session.toLowerCase()] = {
          panna: result.panna,
          digit: result.digit
        };
      }
    });

    // Combine game data with today's timing and results
    let todayData: TodayGameData[] = games.map(game => {
      const todayDay = game.days.find((day: GameDay) => day.day === todayDayName);
      const gameResults = resultsMap.get(game._id.toString()) || {};

      // Convert times to AM/PM format and get period info for sorting
      const openTimeInfo = todayDay ? convertToAMPM(todayDay.open_time) : null;
      const closeTimeInfo = todayDay ? convertToAMPM(todayDay.close_time) : null;

      return {
        game_id: game._id.toString(),
        game_name: game.game_name,
        is_active: game.is_active,
        market_timing: todayDay ? {
          open_time: openTimeInfo?.formattedTime || null,
          close_time: closeTimeInfo?.formattedTime || null,
          market_status: todayDay.market_status,
          period: openTimeInfo?.period || 'AM', // Use open time period for sorting
          sortableTime: openTimeInfo?.sortableTime || '00:00' // Use for time-based sorting
        } : null,
        results: {
          open: gameResults.open || { panna: "***", digit: "*" },
          close: gameResults.close || { panna: "*", digit: "***" }
        }
      };
    });

    // Sort games by timing (AM first, then PM)
    todayData = sortGamesByTiming(todayData);

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
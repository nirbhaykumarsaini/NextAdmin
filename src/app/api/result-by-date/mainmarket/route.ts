import { NextRequest, NextResponse } from 'next/server';
import MainMarketResult from '@/models/MainMarketResult';
import connectDB from '@/config/db';
import { Types } from 'mongoose';
import { GroupedResult, SessionResult } from '../../mainmarket/results/route';
import ApiError from '@/lib/errors/APiError';



export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // ✅ Parse the JSON body to get the result_date
    const body = await request.json();
    const result_date = body.result_date;

    if (!result_date) {
      throw new ApiError('Result Date is required');
    }

    // ✅ Filter results by the provided date
    const results = await MainMarketResult.find({ result_date })
      .sort({ createdAt: -1 })
      .populate("game_id", "game_name")
      .lean<{
        result_date: string;
        session: string;
        panna: string;
        digit: string;
        _id: Types.ObjectId;
        game_id?: { game_name: string };
      }[]>();

    // ✅ Group by game name and session
    const groupedResults = results.reduce<Record<string, GroupedResult>>((acc, result) => {
      const gameName = result?.game_id?.game_name || "Unknown Game";
      const key = `${result.result_date}-${gameName}`;

      if (!acc[key]) {
        acc[key] = {
          result_date: result.result_date,
          game_name: gameName,
          openSession: null,
          closeSession: null,
        };
      }

      const sessionData: SessionResult = {
        panna: result.panna,
        digit: result.digit,
        _id: result._id,
      };

      if (result.session === "open") acc[key].openSession = sessionData;
      else if (result.session === "close") acc[key].closeSession = sessionData;

      return acc;
    }, {});

    return NextResponse.json({
      status: true,
      data: Object.values(groupedResults),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve results";
    return NextResponse.json({ status: false, message });
  }
}
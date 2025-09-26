import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Fund from "@/models/Fund";
import Withdrawal from "@/models/Withdrawal";
import MainMarketBid from "@/models/MainMarketBid";
import StarlineBid from "@/models/StarlineBid";
import GalidisawarBid from "@/models/GalidisawarBid";

export async function GET() {
  try {
    await connectDB();

    // Get today's date range (midnight to 23:59:59)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // ✅ Today's Deposits (only completed)
    const depositsAgg = await Fund.aggregate([
      {
        $match: {
          status: "completed",
          created_at: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const todayDeposits = depositsAgg[0]?.total || 0;

    // ✅ Today's Withdrawals (only completed)
    const withdrawalsAgg = await Withdrawal.aggregate([
      {
        $match: {
          status: "completed",
          created_at: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const todayWithdrawals = withdrawalsAgg[0]?.total || 0;

    // ✅ Today's Total Bids from all markets - FIXED VERSION
    const [mainMarketBids, starlineBids, galidisawarBids] = await Promise.all([
      // Main Market Bids - Count actual bid entries, not documents
      MainMarketBid.aggregate([
        {
          $match: {
            created_at: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $unwind: "$bids" // Unwind to get individual bids
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$bids.bid_amount" }, // Sum individual bid amounts
            count: { $sum: 1 } // Count actual bid entries
          },
        },
      ]),
      
      // Starline Bids
      StarlineBid.aggregate([
        {
          $match: {
            created_at: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $unwind: "$bids" // Unwind to get individual bids
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$bids.bid_amount" }, // Sum individual bid amounts
            count: { $sum: 1 } // Count actual bid entries
          },
        },
      ]),
      
      // Galidisawar Bids
      GalidisawarBid.aggregate([
        {
          $match: {
            created_at: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $unwind: "$bids" // Unwind to get individual bids
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$bids.bid_amount" }, // Sum individual bid amounts
            count: { $sum: 1 } // Count actual bid entries
          },
        },
      ]),
    ]);

    const mainMarketCount = mainMarketBids[0]?.count || 0;
    const starlineCount = starlineBids[0]?.count || 0;
    const galidisawarCount = galidisawarBids[0]?.count || 0;

    const totalbid = mainMarketCount + starlineCount + galidisawarCount;

    // ✅ Profit/Loss (Deposits - Withdrawals)
    const profitLoss = todayDeposits - todayWithdrawals;

    return NextResponse.json({
      status: true,
      message: "Dashboard data retrieved successfully",
      data: {
        deposits: todayDeposits,
        withdrawals: todayWithdrawals,
        profitLoss,
        totalbid
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch dashboard data";
    return NextResponse.json(
      {status: false, message: errorMessage}
    );
  }
}
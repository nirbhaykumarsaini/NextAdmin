import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/config/db";
import ApiError from "@/lib/errors/APiError";

import AppUser from "@/models/AppUser";
import Transaction from "@/models/Transaction";
import MainMarketBid from "@/models/MainMarketBid";
import StarlineBid from "@/models/StarlineBid";
import GalidisawarBid from "@/models/GalidisawarBid";

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const body = await request.json();
    const { market_type, game_id, date } = body;

    if (!market_type || !game_id || !date) {
      throw new ApiError("market_type, game_id, and date are required");
    }

    const gameObjectId = new mongoose.Types.ObjectId(game_id);
    const targetDate = new Date(date);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let BidModel;
    switch (market_type) {
      case "mainmarket":
        BidModel = MainMarketBid;
        break;
      case "starline":
        BidModel = StarlineBid;
        break;
      case "galidisawar":
        BidModel = GalidisawarBid;
        break;
      default:
        throw new ApiError("Invalid market type");
    }

    // ✅ Fetch bids and populate game names
    const mainBids = await BidModel.find({
      "bids.game_id": gameObjectId,
      created_at: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("bids.game_id", "game_name")
      .session(session);

    if (!mainBids || mainBids.length === 0) {
      return NextResponse.json({
        status: false,
        message: "No bids found for this game and date",
      });
    }

    const refundDetails: any[] = [];

    for (const mainBid of mainBids) {
      const user = await AppUser.findById(mainBid.user_id).session(session);
      if (!user) continue;

      // Match only bids for this game
      const matchingBids = mainBid.bids.filter(
        (b: any) => b.game_id._id.toString() === gameObjectId.toString()
      );

      if (matchingBids.length === 0) continue;

      const totalRefund = matchingBids.reduce(
        (sum: number, b: any) => sum + b.bid_amount,
        0
      );

      // ✅ Get game name for description
      const gameName = matchingBids[0]?.game_id?.game_name || "Unknown Game";

      // Refund user
      user.balance += totalRefund;
      await user.save({ session });

      // Create refund transaction
      const transaction = await Transaction.create(
        [
          {
            user_id: user._id,
            amount: totalRefund,
            type: "credit",
            description: `Refund for reverted bids of game ${gameName} on ${date}`,
            status: "completed",
          },
        ],
        { session }
      );

      // Remove refunded bids
      mainBid.bids = mainBid.bids.filter(
        (b: any) => b.game_id._id.toString() !== gameObjectId.toString()
      );

      if (mainBid.bids.length === 0) {
        await BidModel.deleteOne({ _id: mainBid._id }).session(session);
      } else {
        mainBid.total_amount = mainBid.bids.reduce(
          (sum: number, b: any) => sum + b.bid_amount,
          0
        );
        await mainBid.save({ session });
      }

      refundDetails.push({
        user_id: user._id,
        refunded_amount: totalRefund,
        game_name: gameName,
        transaction_id: transaction[0]._id,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      status: true,
      message: "Bids reverted successfully",
    //   data: refundDetails,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    const message =
      error instanceof ApiError ? error.message : error.message || "Failed to revert bids";

    return NextResponse.json({
      status: false,
      message,
    });
  }
}

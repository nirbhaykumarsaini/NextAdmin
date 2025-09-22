// ✅ GET: Fetch user withdrawal methods





import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import ApiError from "@/lib/errors/APiError";
import mongoose from "mongoose";
import WithdrawalMethod from "@/models/WithdrawalMethod";


export async function POST(request: Request) {
  try {
    await dbConnect();

    const {user_id} = await request.json()

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError("Invalid or missing user ID");
    }

    const withdrawalMethods = await WithdrawalMethod.find({ user_id });

    return NextResponse.json({
      status: true,
      data: withdrawalMethods,
    });
  } catch (error: unknown) {
    console.error("Withdrawal Method GET Error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch withdrawal methods";
    return NextResponse.json({ status: false, message: errorMessage });
  }
}
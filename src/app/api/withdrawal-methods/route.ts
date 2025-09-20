import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import ApiError from "@/lib/errors/APiError";
import mongoose from "mongoose";
import WithdrawalMethod from "@/models/WithdrawalMethod";
import AppUser from "@/models/AppUser";

// ✅ POST: Add Withdrawal Method
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { user_id, withdraw_type, ...fields } = body;

    // ✅ Validate user_id
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError("Invalid user ID");
    }

    // ✅ Find user
    const user = await AppUser.findById(user_id);
    if (!user) {
      throw new ApiError("User not found");
    }

    // ✅ Create withdrawal method
    const withdrawalMethod = new WithdrawalMethod({
      user_id,
      withdraw_type,
      ...fields,
    });

    await withdrawalMethod.validate(); // run schema validation
    await withdrawalMethod.save();

    return NextResponse.json({
      status: true,
      message: "Withdrawal method added successfully",
      data: withdrawalMethod,
    });
  } catch (error: unknown) {
    console.error("Withdrawal Method POST Error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to add withdrawal method";
    return NextResponse.json({ status: false, message: errorMessage });
  }
}

// ✅ GET: Fetch user withdrawal methods
export async function GET(request: Request) {
  try {
    await dbConnect();

    const {user_id} = await request.json()

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError("Invalid or missing user ID");
    }

    const withdrawalMethods = await WithdrawalMethod.find({ user_id });

    return NextResponse.json({
      status: true,
      count: withdrawalMethods.length,
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

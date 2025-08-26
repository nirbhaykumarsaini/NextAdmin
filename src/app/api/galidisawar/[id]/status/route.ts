// app/api/main-market/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB  from "@/config/db";
import GalidisawarGame  from "@/models/GalidisawarGame";
import  ApiError  from "@/lib/errors/APiError";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    if (!id) throw new ApiError("Game ID is required");

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      throw new ApiError("is_active must be a boolean");
    }

    const game = await GalidisawarGame.findByIdAndUpdate(
      id,
      { is_active },
      { new: true, runValidators: true }
    );
    
    if (!game) throw new ApiError("Game not found");

    return NextResponse.json({
      status: true,
      message: "Game status updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || "Failed to update status" 
      }
    );
  }
}
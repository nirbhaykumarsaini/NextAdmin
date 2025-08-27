import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import MainmarketRate from "@/models/MainmarketRate";
import ApiError from "@/lib/errors/APiError";

// GET - Get all rates
export async function GET() {
    try {
        await connectDB();

        const rates = await MainmarketRate.findOne()

        return NextResponse.json({
            status: true,
            message: "Rates retrieved successfully",
            data: rates
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message :  "Failed to retrieve rates"
        return NextResponse.json(
            {
                status: false,
                message: errorMessage 
            },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, rateData } = body;

        if (!rateData) {
            throw new ApiError('Rate data is required');
        }

        let result;
        let message;

        if (id) {
            // PUT operation - Update existing rate
            const updatedRate = await MainmarketRate.findByIdAndUpdate(
                id,
                rateData,
                { new: true, runValidators: true }
            );

            if (!updatedRate) {
                throw new ApiError('Rate not found');
            }

            result = updatedRate;
            message = "Rate updated successfully";
        } else {
            // POST operation - Create new rate
            const newRate = await MainmarketRate.create(rateData);
            result = newRate;
            message = "Rate added successfully";
        }

        return NextResponse.json({
            status: true,
            message,
            data: result
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message :  "Failed to process rate"
        return NextResponse.json(
            {
                status: false,
                message: errorMessage
            });
    }
}
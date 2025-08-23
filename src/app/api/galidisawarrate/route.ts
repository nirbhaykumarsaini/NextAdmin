import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import GalidisawarRate from "@/models/GalidisawarRate";
import ApiError from "@/lib/errors/APiError";

// GET - Get all rates
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const rates = await GalidisawarRate.findOne()

        return NextResponse.json({
            status: true,
            message: "Rates retrieved successfully",
            data: rates
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: false,
                message: error.message || "Failed to retrieve rates"
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
            const updatedRate = await GalidisawarRate.findByIdAndUpdate(
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
            const newRate = await GalidisawarRate.create(rateData);
            result = newRate;
            message = "Rate added successfully";
        }

        return NextResponse.json({
            status: true,
            message,
            data: result
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: false,
                message: error.message || "Failed to process rate"
            });
    }
}
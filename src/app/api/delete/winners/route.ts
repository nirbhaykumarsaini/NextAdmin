import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import MainMarketWinner from '@/models/MainMarketWinner';
import StarlineWinner from '@/models/StarlineWinner';
import GalidisawarWinner from '@/models/GalidisawarWinner';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const { from_date, to_date, market_type } = body;

        // Validate required fields
        if (!from_date || !to_date || !market_type) {
            throw new ApiError('Missing required fields: from_date, to_date, and market_type are required');
        }

        // Convert dates to proper format
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day

        // Validate date range
        if (startDate > endDate) {
            throw new ApiError('From date cannot be after to date');
        }

        let deleteResult;
        let deletedCount = 0;

        // Delete bids based on market type - using created_at instead of createdAt
        switch (market_type) {
            case "mainmarket":
                deleteResult = await MainMarketWinner.deleteMany({
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                });
                deletedCount = deleteResult.deletedCount;
                break;

            case "starline":
                deleteResult = await StarlineWinner.deleteMany({
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                });
                deletedCount = deleteResult.deletedCount;
                break;

            case "galidisawar":
                deleteResult = await GalidisawarWinner.deleteMany({
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                });
                deletedCount = deleteResult.deletedCount;
                break;

            default:
                throw new ApiError('Invalid market type');
        }

        return NextResponse.json({
            status: true,
            message: `${market_type} winners deleted successfully`,
        });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message });}

        const errorMessage = error instanceof Error ? error.message : 'Failed to delete winners';

        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}
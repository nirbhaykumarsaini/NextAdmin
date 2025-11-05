import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Withdrawal from '@/models/Withdrawal';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const { from_date, to_date } = body;

        // Validate required fields
        if (!from_date || !to_date) {
            throw new ApiError('Missing required fields: from_date, to_date are required');
        }

        // Convert dates to proper format
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day

        // Validate date range
        if (startDate > endDate) {
            throw new ApiError('From date cannot be after to date');
        }

        const deleteResult = await Withdrawal.deleteMany({
            created_at: {
                $gte: startDate,
                $lte: endDate
            }
        });

        return NextResponse.json({
            status: true,
            message: `Withdrawals deleted successfully`,
        });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ status: false, message: error.message });
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to delete withdrawals';

        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import Withdrawal from '@/models/Withdrawal';
import mongoose from 'mongoose';



export async function POST(
    request: Request
) {
    try {
        await dbConnect();
        const { user_id } = await request.json();

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new ApiError('Invalid user ID');
        }

        const withdrawals = await Withdrawal.find({ user_id: user_id })
            .populate('user_id', 'name mobile_number')
            .sort({ created_at: -1 })
            .lean();

        return NextResponse.json({
            status: true,
            message: 'Withdrawals fetched successfully',
            data: withdrawals
        });
    } catch (error: unknown) {
        console.error('Get Withdrawals Error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json(
                { status: false, message: error.message }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch withdrawals';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
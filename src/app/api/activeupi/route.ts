import { NextResponse } from 'next/server';
import ManageUpi from '@/models/ManageUpi';
import connectDB from '@/config/db';
import ManageQR from '@/models/ManageQR';

// GET all Upi
export async function GET() {
    try {
        await connectDB();

        const upi = await ManageUpi.findOne({ is_active: true });
        const qrcode = await ManageQR.findOne({ is_active: true });

        return NextResponse.json({
            status: true,
            data: {
                upi,
                qrcode
            }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve upi'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
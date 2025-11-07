import { NextResponse } from 'next/server';
import ManageUpi from '@/models/ManageUpi';
import connectDB from '@/config/db';
import ManageQR from '@/models/ManageQR';

// GET all Upi
export async function GET() {
    try {
        await connectDB();

        const upis = await ManageUpi.find({ is_active: true });
        const qrcode = await ManageQR.find({ is_active: true });

        return NextResponse.json({
            status: true,
            data: {
                upis,
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
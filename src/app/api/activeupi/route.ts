import { NextResponse } from 'next/server';
import ManageUpi from '@/models/ManageUpi';
import connectDB from '@/config/db';

// GET all Upi
export async function GET() {
    try {
        await connectDB();

        const upis = await ManageUpi.find({is_active:true});

        return NextResponse.json({
            status: true,
            data: upis
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message :  'Failed to retrieve upi'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
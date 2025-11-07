import { NextRequest, NextResponse } from 'next/server';
import ManageUpi from '@/models/ManageUpi';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import ManageQR from '@/models/ManageQR';

// GET all Upi
export async function GET() {
    try {
        await connectDB();

        const upis = await ManageUpi.find();
        const qrcode = await ManageQR.find();



        return NextResponse.json({
            status: true,
            data: {
                upis,
                qrcode
            }

        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message :  'Failed to retrieve upi'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// CREATE a new fupi
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { upi_id } = body

        if (!upi_id) {
            throw new ApiError('upi_id are required');
        }

         await ManageUpi.create({
            upi_id
        });

        return NextResponse.json({
            status: true,
            message: 'UPI created successfully',
        });

    } catch (error: unknown) {
        console.error('Error saving upi:', error);
        const errorMessage = error instanceof Error ? error.message :  'Failed to add upi'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// UPDATE a upi
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('ID is required');
        }

        const body = await request.json();
        const { upi_id } = body;

        const updatedUPI = await ManageUpi.findByIdAndUpdate(
            id,
            {upi_id},
            { new: true, runValidators: true }
        );

        if (!updatedUPI) {
            throw new ApiError('UPI not found');
        }

        return NextResponse.json({
            status: true,
            message: 'UPI updated successfully',
        });

    } catch (error: unknown) {
        console.error('Error updating UPI:', error);
         const errorMessage = error instanceof Error ? error.message :  'Failed to update UPI'
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}

// DELETE a upi
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('ID is required');
        }

        const deleteUPI = await ManageUpi.findByIdAndDelete(id);

        if (!deleteUPI) {
            throw new ApiError('UPI not found');
        }

        return NextResponse.json({
            status: true,
            message: 'UPI deleted successfully'
        });

    } catch (error: unknown) {
        console.error('Error deleting UPI:', error);
         const errorMessage = error instanceof Error ? error.message :  'Failed to delete UPI' 
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}

// PATCH - Toggle UPI is_active status
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) throw new ApiError('ID is required');

        const upi = await ManageUpi.findById(id);
        if (!upi) throw new ApiError('UPI not found');

        if (!upi.is_active) {
            // Activate this UPI
            await ManageUpi.updateMany({}, { is_active: false });
            upi.is_active = true;

            // Deactivate all QR codes
            const ManageQR = (await import('@/models/ManageQR')).default;
            await ManageQR.updateMany({}, { is_active: false });
        } else {
            // Prevent all inactive
            throw new ApiError('At least one payment method must remain active');
        }

        await upi.save();

        return NextResponse.json({
            status: true,
            message: 'UPI activated successfully',
        });

    } catch (error: unknown) {
        console.error('Error toggling UPI status:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to toggle UPI status';
        return NextResponse.json({ status: false, message: errorMessage });
    }
}



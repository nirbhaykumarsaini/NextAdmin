import { NextRequest, NextResponse } from 'next/server';
import ManageUpi from '@/models/ManageUpi';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all Upi
export async function GET() {
    try {
        await connectDB();

        const upis = await ManageUpi.find();

        return NextResponse.json({
            status: true,
            data: upis
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to retrieve upi' }
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

        const upi = await ManageUpi.create({
            upi_id
        });

        return NextResponse.json({
            status: true,
            message: 'UPI created successfully',
        });

    } catch (error: any) {
        console.error('Error saving upi:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to add upi' }
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
        console.log(upi_id)

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

    } catch (error: any) {
        console.error('Error updating UPI:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to update UPI' });
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

    } catch (error: any) {
        console.error('Error deleting UPI:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to delete UPI' });
    }
}

// TOGGLE is_active status
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('ID is required');
        }

        const upi = await ManageUpi.findById(id);

        if (!upi) {
            throw new ApiError('UPI not found');
        }

        upi.is_active = !upi.is_active;
        await upi.save();

        return NextResponse.json({
            status: true,
            message: `UPI ${upi.is_active ? 'activated' : 'deactivated'} successfully`,
        });

    } catch (error: any) {
        console.error('Error toggling UPI status:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to toggle UPI status' });
    }
}
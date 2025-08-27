import { NextRequest, NextResponse } from 'next/server';
import Notice from '@/models/Notice';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all Notice
export async function GET() {
    try {
        await connectDB();

        const notices = await Notice.find();

        return NextResponse.json({
            status: true,
            data: notices
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve notices'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// CREATE a new Notice
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { notice_title, notice_message } = body

        if (!notice_title && !notice_message) {
            throw new ApiError('notice_title and notice_message are required');
        }

         await Notice.create({
            notice_title,
            notice_message
        });

        return NextResponse.json({
            status: true,
            message: 'Notice sent successfully',
        });

    } catch (error: unknown) {
        console.error('Error to sent notice:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to sent notice'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// UPDATE a Notice
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('ID is required');
        }

        const body = await request.json();
        const { notice_title, notice_message } = body;

        const updatedNotice = await Notice.findByIdAndUpdate(
            id,
            { notice_title, notice_message },
            { new: true, runValidators: true }
        );

        if (!updatedNotice) {
            throw new ApiError('Notice not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Notice updated successfully',
        });

    } catch (error: unknown) {
        console.error('Error updating Notice:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update Notice'
        return NextResponse.json(
            { status: false, message: errorMessage });
    }
}

// DELETE a Notice
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('ID is required');
        }

        const deleteNotice = await Notice.findByIdAndDelete(id);

        if (!deleteNotice) {
            throw new ApiError('Notice not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Notice deleted successfully'
        });

    } catch (error: unknown) {
        console.error('Error deleting Notice:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete Notice'
        return NextResponse.json(
            { status: false, message:errorMessage });
    }
}

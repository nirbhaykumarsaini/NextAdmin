import { NextRequest, NextResponse } from 'next/server';
import FooterLink from '@/models/FooterLinks';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all footer links
export async function GET() {
    try {
        await connectDB();

        const footers = await FooterLink.find().sort({ createdAt: -1 });

        return NextResponse.json({
            status: true,
            data: footers
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to retrieve footer links' }
        );
    }
}

// CREATE a new footer link
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const footer_name = formData.get('footer_name') as string;
        const footer_link = formData.get('footer_link') as string;

        if (!footer_name || !footer_link) {
            throw new ApiError('footer_name and footer_link are required');
        }

        const footer = await FooterLink.create({
            footer_name,
            footer_link
        });

        return NextResponse.json({
            status: true,
            message: 'Footer link created successfully',
            data: footer
        });

    } catch (error: any) {
        console.error('Error saving footer link:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to add footer link' }
        );
    }
}

// UPDATE a footer link
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Footer link ID is required');
        }

        const body = await request.json();
        const { footer_name, footer_link, is_active } = body;

        const updateData: any = {};
        if (footer_name) updateData.footer_name = footer_name;
        if (footer_link) updateData.footer_link = footer_link;
        if (typeof is_active !== 'undefined') updateData.is_active = is_active;

        const updatedFooter = await FooterLink.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedFooter) {
            throw new ApiError('Footer link not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Footer link updated successfully',
            data: updatedFooter
        });

    } catch (error: any) {
        console.error('Error updating footer link:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to update footer link' });
    }
}

// DELETE a footer link
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Footer link ID is required');
        }

        const deletedFooter = await FooterLink.findByIdAndDelete(id);

        if (!deletedFooter) {
            throw new ApiError('Footer link not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Footer link deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting footer link:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to delete footer link' });
    }
}

// TOGGLE is_active status
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Footer link ID is required');
        }

        const footer = await FooterLink.findById(id);

        if (!footer) {
            throw new ApiError('Footer link not found');
        }

        footer.is_active = !footer.is_active;
        await footer.save();

        return NextResponse.json({
            status: true,
            message: `Footer link ${footer.is_active ? 'activated' : 'deactivated'} successfully`,
            data: footer
        });

    } catch (error: any) {
        console.error('Error toggling footer link status:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to toggle footer link status' });
    }
}
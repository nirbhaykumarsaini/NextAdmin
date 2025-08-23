import { NextRequest, NextResponse } from 'next/server';
import Permission from '@/models/Permission';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all permissions
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = {};
        if (category) {
            query = { category };
        }

        const permissions = await Permission.find(query).sort({ category: 1, permission_name: 1 });

        return NextResponse.json({
            status: true,
            data: permissions
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to retrieve permissions' }
        );
    }
}

// CREATE a new permission
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { permission_name, permission_key, permission_description, category } = body;

        // Validate required fields
        if (!permission_name) {
            throw new ApiError('Permission name is required');
        }
        if (!permission_key) {
            throw new ApiError('Permission key is required');
        }
        if (!permission_description) {
            throw new ApiError('Permission description is required');
        }
        if (!category) {
            throw new ApiError('Permission category is required');
        }

        // Check if permission key already exists
        const existingPermission = await Permission.findOne({ permission_key: permission_key.toLowerCase() });
        if (existingPermission) {
            throw new ApiError('Permission key already exists');
        }

        const permission = await Permission.create({
            permission_name,
            permission_key: permission_key.toLowerCase(),
            permission_description,
            category
        });

        return NextResponse.json({
            status: true,
            message: 'Permission created successfully',
            data: permission
        });

    } catch (error: any) {
        console.error('Error creating permission:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to create permission' }
        );
    }
}

// UPDATE a permission
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Permission ID is required');
        }

        const body = await request.json();
        const { permission_name, permission_description,permission_key, category } = body;

        // Don't allow updating the key as it should be immutable
        const updateData: any = {};
        if (permission_name) updateData.permission_name = permission_name;
        if (permission_key) updateData.permission_key = permission_key;
        if (permission_description) updateData.permission_description = permission_description;
        if (category) updateData.category = category;

        const updatedPermission = await Permission.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPermission) {
            throw new ApiError('Permission not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Permission updated successfully',
            data: updatedPermission
        });

    } catch (error: any) {
        console.error('Error updating permission:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to update permission' }
        );
    }
}

// DELETE a permission
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Permission ID is required');
        }

        const deletedPermission = await Permission.findByIdAndDelete(id);

        if (!deletedPermission) {
            throw new ApiError('Permission not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Permission deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting permission:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to delete permission' }
        );
    }
}
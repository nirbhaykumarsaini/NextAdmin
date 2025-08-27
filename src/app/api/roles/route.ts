import { NextRequest, NextResponse } from 'next/server';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all roles with populated permissions and user count
export async function GET() {
    try {
        await connectDB();

        const roles = await Role.find()
            .populate('permissions', 'permission_name permission_key permission_description')

        // Format the response to include user count instead of user objects
        const formattedRoles = roles.map(role => ({
            _id: role._id,
            role_name: role.role_name,
            role_description: role.role_description,
            permissions: role.permissions
        }));

        return NextResponse.json({
            status: true,
            data: formattedRoles,

        });
    } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve roles'
        return NextResponse.json(
            { status: false, message: errorMessage  }
        );
    }
}

// CREATE a new role
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { role_name, role_description, permissions } = body;

        // Validate required fields
        if (!role_name) {
            throw new ApiError('Role name is required');
        }
        if (!role_description) {
            throw new ApiError('Role description is required');
        }
        if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
            throw new ApiError('At least one permission is required');
        }

        // Check if role name already exists
        const existingRole = await Role.findOne({ role_name });
        if (existingRole) {
            throw new ApiError('Role name already exists');
        }

        // Validate that all permission IDs exist
        const validPermissions = await Permission.find({ _id: { $in: permissions } });
        if (validPermissions.length !== permissions.length) {
            throw new ApiError('One or more permission IDs are invalid');
        }

        const role = await Role.create({
            role_name,
            role_description,
            permissions,
        });

        // Populate the permissions in the response
        const populatedRole = await Role.findById(role._id).populate('permissions', 'permission_name permission_key permission_description');

        return NextResponse.json({
            status: true,
            message: 'Role created successfully',
            data: populatedRole
        });

    } catch (error: unknown) {
        console.error('Error creating role:', error);
         const errorMessage = error instanceof Error ? error.message : 'Failed to create role'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// UPDATE a role
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Role ID is required');
        }

        const body = await request.json();
        const { role_name, role_description, permissions } = body;

        // Check if role exists
        const existingRole = await Role.findById(id);
        if (!existingRole) {
            throw new ApiError('Role not found');
        }

        // Check if name is being changed and if new name already exists
        if (role_name && role_name !== existingRole.role_name) {
            const roleWithSameName = await Role.findOne({ role_name, _id: { $ne: id } });
            if (roleWithSameName) {
                throw new ApiError('Role name already exists');
            }
        }

        // Validate permissions if provided
        if (permissions && Array.isArray(permissions)) {
            if (permissions.length === 0) {
                throw new ApiError('At least one permission is required');
            }

            const validPermissions = await Permission.find({ _id: { $in: permissions } });
            if (validPermissions.length !== permissions.length) {
                throw new ApiError('One or more permission IDs are invalid');
            }
        }

        const updateData: any = {};
        if (role_name) updateData.role_name = role_name;
        if (role_description) updateData.role_description = role_description;
        if (permissions) updateData.permissions = permissions;

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('permissions', 'permission_name permission_key permission_description');

        return NextResponse.json({
            status: true,
            message: 'Role updated successfully',
            data: updatedRole
        });

    } catch (error: unknown) {
        console.error('Error updating role:', error);
         const errorMessage = error instanceof Error ? error.message : 'Failed to update role'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

// DELETE a role
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ApiError('Role ID is required');
        }

        // Check if role has users assigned
        const role = await Role.findById(id).populate('users');
        if (!role) {
            throw new ApiError('Role not found');
        }

        const deletedRole = await Role.findByIdAndDelete(id);

        if (!deletedRole) {
            throw new ApiError('Role not found');
        }

        return NextResponse.json({
            status: true,
            message: 'Role deleted successfully'
        });

    } catch (error: unknown) {
        console.error('Error deleting role:', error);
         const errorMessage = error instanceof Error ? error.message : 'Failed to delete role'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
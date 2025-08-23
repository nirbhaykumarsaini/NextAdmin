import { NextRequest, NextResponse } from 'next/server';
import Maintenance from '@/models/Maintenance';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET maintenance settings
export async function GET() {
    try {
        await connectDB();

        // We'll only have one maintenance document
        const maintenance = await Maintenance.findOne();

        // If no maintenance settings exist, return default values
        if (!maintenance) {
            return NextResponse.json({
                status: true,
                data: {
                    is_active: false,
                    maintenance_title: '',
                    expected_completion_date: null,
                    expected_completion_time: '',
                    maintenance_message: ''
                }
            });
        }

        return NextResponse.json({
            status: true,
            data: maintenance
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to retrieve maintenance settings' }
        );
    }
}

// CREATE or UPDATE maintenance settings
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { 
            is_active, 
            maintenance_title, 
            expected_completion_date, 
            expected_completion_time, 
            maintenance_message 
        } = body;

        // Validate required fields when enabling maintenance mode
        if (is_active && !maintenance_message) {
            throw new ApiError('Maintenance message is required when enabling maintenance mode');
        }

        // Check if maintenance settings already exist
        const existingMaintenance = await Maintenance.findOne();

        if (existingMaintenance) {
            // Update the existing document
            const updatedMaintenance = await Maintenance.findByIdAndUpdate(
                existingMaintenance._id,
                {
                    is_active,
                    maintenance_title: is_active ? maintenance_title : '',
                    expected_completion_date: is_active ? expected_completion_date : null,
                    expected_completion_time: is_active ? expected_completion_time : '',
                    maintenance_message: is_active ? maintenance_message : ''
                },
                { new: true, runValidators: true }
            );

            return NextResponse.json({
                status: true,
                message: 'Maintenance settings updated successfully',
                data: updatedMaintenance
            });
        } else {
            // Create a new document
            const newMaintenance = await Maintenance.create({
                is_active,
                maintenance_title: is_active ? maintenance_title : '',
                expected_completion_date: is_active ? expected_completion_date : null,
                expected_completion_time: is_active ? expected_completion_time : '',
                maintenance_message: is_active ? maintenance_message : ''
            });

            return NextResponse.json({
                status: true,
                message: 'Maintenance settings created successfully',
                data: newMaintenance
            });
        }

    } catch (error: any) {
        console.error('Error updating maintenance settings:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to update maintenance settings' }
        );
    }
}
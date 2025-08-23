import { NextRequest, NextResponse } from 'next/server';
import HowToPlay from '@/models/HowToPlay';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';

// GET all HowToPlay
export async function GET() {
    try {
        await connectDB();

        const howtoplay = await HowToPlay.find();

        return NextResponse.json({
            status: true,
            data: howtoplay
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to retrieve HowToPlay' }
        );
    }
}

// CREATE or UPDATE HowToPlay
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { howtoplay_title, howtoplay_message, video_id } = body;

        // Check if all required fields are provided
        if (!howtoplay_title) {
            throw new ApiError('howtoplay_title is required');
        }
        
        if (!howtoplay_message) {
            throw new ApiError('howtoplay_message is required');
        }
        
        if (!video_id) {
            throw new ApiError('video_id is required');
        }

        // Check if a document already exists
        const existingHowToPlay = await HowToPlay.findOne();

        if (existingHowToPlay) {
            // Update the existing document
            const updatedHowToPlay = await HowToPlay.findByIdAndUpdate(
                existingHowToPlay._id,
                {
                    howtoplay_title,
                    howtoplay_message,
                    video_id
                },
                { new: true, runValidators: true }
            );

            return NextResponse.json({
                status: true,
                message: 'HowToPlay updated successfully',
                data: updatedHowToPlay
            });
        } else {
            // Create a new document
            const newHowToPlay = await HowToPlay.create({
                howtoplay_title,
                howtoplay_message,
                video_id
            });

            return NextResponse.json({
                status: true,
                message: 'HowToPlay created successfully',
                data: newHowToPlay
            });
        }

    } catch (error: any) {
        console.error('Error adding/updating HowToPlay:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to add/update HowToPlay' }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import Slider from '@/models/Slider';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';


export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const slider_image = formData.get('slider_image') as File;

        if (!slider_image) {
            throw new ApiError('Image are required')
        }

        if (!slider_image.type.startsWith('image/')) {
            throw new ApiError('Only image files are allowed')
        }

        const uploadsDir = join(process.cwd(), 'public/sliders');
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const extension = slider_image.name.split('.').pop();
        const filename = `logo_${timestamp}.${extension}`;
        const filePath = join(uploadsDir, filename);

        const bytes = await slider_image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const relativePath = `/sliders/${filename}`;

        let slider = await Slider.findOne();

        if (slider) {
            slider.slider_image = relativePath;
            await slider.save();
        } else {
            slider = await Slider.create({
                slider_image: relativePath
            });
        }

        return NextResponse.json({
            status: true,
            message: 'Logo and app title saved successfully',
        });

    } catch (error: unknown) {
        console.error('Error saving logo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add app config'
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const slider = await Slider.findOne();

        if (!slider) {
            return NextResponse.json({
                status: true,
                data: null
            });
        }

        // Get the base URL from the request
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Create complete image URL
        const completeImageUrl = slider.slider_image 
            ? `${baseUrl}${slider.slider_image}`
            : null;

        // Return slider data with complete image URL
        const sliderData = {
            ...slider.toObject(),
            slider_image_url: completeImageUrl,
            slider_image: slider.slider_image // Keep the relative path as well if needed
        };

        return NextResponse.json({
            status: true,
            data: sliderData
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve app config'
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: 500 }
        );
    }
}
// app/api/logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import AppConfig from '@/models/AppConfig';
import connectDB from '@/config/db';
import ApiError from '@/lib/errors/APiError';


export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const app_title = formData.get('app_title') as string;
        const logo_image = formData.get('logo_image') as File;

        if (!app_title || !logo_image) {
            throw new ApiError('App title and logo image are required')
        }

        if (!logo_image.type.startsWith('image/')) {
            throw new ApiError('Only image files are allowed')
        }

        const uploadsDir = join(process.cwd(), 'public/uploads');
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const extension = logo_image.name.split('.').pop();
        const filename = `logo_${timestamp}.${extension}`;
        const filePath = join(uploadsDir, filename);

        const bytes = await logo_image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const relativePath = `/uploads/${filename}`;

        let appConfig = await AppConfig.findOne();

        if (appConfig) {
            appConfig.app_title = app_title;
            appConfig.logo_image = relativePath;
            await appConfig.save();
        } else {
            appConfig = await AppConfig.create({
                app_title,
                logo_image: relativePath
            });
        }

        return NextResponse.json({
            status: true,
            message: 'Logo and app title saved successfully',
        });

    } catch (error:unknown) {
        console.error('Error saving logo:', error);
        const errorMessage = error instanceof Error ? error.message :  'Failed to add app config'
        return NextResponse.json(
            { status: false, message: errorMessage  }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const appConfig = await AppConfig.findOne();

        if (!appConfig) {
            return NextResponse.json({
                status: true,
                data: null
            });
        }

        // Get the base URL from the request
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Create complete logo image URL
        const completeLogoUrl = appConfig.logo_image 
            ? `${baseUrl}${appConfig.logo_image}`
            : null;

        // Return app config data with complete logo URL
        const appConfigData = {
            ...appConfig.toObject(),
            logo_image_url: completeLogoUrl,
            logo_image: appConfig.logo_image // Keep the relative path as well
        };

        return NextResponse.json({
            status: true,
            data: appConfigData
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve app config'
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: 500 }
        );
    }
}
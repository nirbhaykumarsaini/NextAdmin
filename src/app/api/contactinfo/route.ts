// app/api/logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ContactInfo from '@/models/ContactInfo';
import connectDB from '@/config/db';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Parse the JSON body first
        const body = await request.json();
        const { mobile_number, whatshapp_number, website_link, telegram_channel, email } = body;

        let contactInfo = await ContactInfo.findOne();

        if (contactInfo) {
            contactInfo.mobile_number = mobile_number;
            contactInfo.whatshapp_number = whatshapp_number;
            contactInfo.website_link = website_link;
            contactInfo.telegram_channel = telegram_channel;
            contactInfo.email = email;
            await contactInfo.save();
        } else {
            contactInfo = await ContactInfo.create({
                mobile_number,
                whatshapp_number,
                website_link,
                telegram_channel,
                email
            });
        }

        return NextResponse.json({
            status: true,
            message: 'Contact information saved successfully',
        });

    } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : 'Failed to save contact information';
        return NextResponse.json(
            { status: false, message: errorMessage  },
        );
    }
}

// GET method to retrieve contact info
export async function GET() {
    try {
        await connectDB();
        
        const contactInfo = await ContactInfo.findOne();
        
        return NextResponse.json({
            status: true,
            data: contactInfo || {}
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contact information';
        return NextResponse.json(
            { status: false, message: errorMessage  },
        );
    }
}
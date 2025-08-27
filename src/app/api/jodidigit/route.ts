import { NextResponse } from 'next/server';
import JodiDigit from '@/models/JodiDigit';
import connectDB from '@/config/db';

export async function GET() {
    try {
        await connectDB(); // Connect to database

        const existingDigits = await JodiDigit.find({});

        if (existingDigits.length === 0) {
            // Create all possible jodi digits (00 to 99)
            const digitsToSave = Array.from({ length: 100 }, (_, i) => ({
                digit: i.toString().padStart(2, '0') // Store as string with leading zero
            }));

            await JodiDigit.insertMany(digitsToSave);
            console.log("Successfully saved jodi digits 00-99 to the database");
        }

        const allDigits = await JodiDigit.find({}).sort({ digit: 1 });

        // Format the digits to ensure two-digit display
        const formattedDigits = allDigits.map(digitObj => ({
            _id: digitObj._id,
            digit: digitObj.digit,
        }));

        return NextResponse.json({
            status: true,
            message: "Jodi digits retrieved successfully",
            data: formattedDigits
        });

    } catch (error: unknown) {
        console.error('Error in allJodiDigit:', error);
        const errorMessage = error instanceof Error ? error.message :  'Failed to retrieve jodi digits'
        return NextResponse.json(
            {
                status: false,
                message: errorMessage 
            }
        );
    }
}
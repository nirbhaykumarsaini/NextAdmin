import { NextResponse } from 'next/server';
import SingleDigit from '@/models/SingleDigit';
import connectDB from '@/config/db';

export async function GET() {
  try {
    await connectDB(); // Make sure to connect to the database

    const existingDigits = await SingleDigit.find({});
    
    if (existingDigits.length === 0) {
      const digitsToSave = Array.from({ length: 10 }, (_, i) => ({ digit: i }));
      await SingleDigit.insertMany(digitsToSave);
      console.log("Successfully saved single digits 0-9 to the database");
    }

    const allDigits = await SingleDigit.find({}).sort({ digit: 1 });
    
    allDigits.forEach((digitObj: { digit: number; }) => {
      console.log(`Digit : ${digitObj.digit}`);
    });

    return NextResponse.json({
      status: true,
      message: "Single digits retrieved successfully",
      data: allDigits
    });
    
  } catch (error: unknown) {
    console.error('Error in allSingleDigit:', error);
     const errorMessage = error instanceof Error ? error.message :'Failed to retrieve single digits'
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}
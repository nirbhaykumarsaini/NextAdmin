import { NextRequest, NextResponse } from 'next/server';
import TriplePanna from '@/models/TriplePanna';
import connectDB from '@/config/db';

const TP_PANA_DATA = ["000", "111", "222", "333", "444", "555", "666", "777", "888", "999"];

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // First delete all existing digits to prevent duplicates
    await TriplePanna.deleteMany({});

    // Create all triple panna digits (000, 111, ..., 999)
    const digitsToSave = TP_PANA_DATA.map(digit => ({
      digit: digit
    }));

    // Insert new digits
    await TriplePanna.insertMany(digitsToSave);
    console.log("Successfully saved triple panna digits 000-999 to the database");

    // Retrieve all digits sorted numerically
    const allDigits = await TriplePanna.find({}).sort({ digit: 1 });

    return NextResponse.json({
      status: true,
      message: "Triple panna digits retrieved successfully",
      data: allDigits
    });

  } catch (error: any) {
    console.error('Error in allTriplePanna:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to retrieve triple panna' },
      { status: 500 }
    );
  }
}
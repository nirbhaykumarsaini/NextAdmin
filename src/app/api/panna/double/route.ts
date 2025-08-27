import { NextResponse } from 'next/server';
import DoublePanna from '@/models/DoublePanna';
import connectDB from '@/config/db';
import { Model } from 'mongoose';

const DP_PANA_DATA = [
  "118", "226", "244", "299", "334", "488", "550", "668", "677",
  "100", "119", "155", "227", "335", "344", "399", "588", "669",
  "110", "200", "228", "255", "336", "499", "660", "688", "778",
  "166", "229", "300", "337", "355", "445", '599', "779", "788",
  "112", "220", "266", "338", "400", "446", "455", "699", "770",
  "113", "122", '177', "339", "366", "447", "500", "799", "889",
  "600", "114", "277", "330", "448", "466", "556", "880", "899",
  "115", "133", "188", "223", "377", "449", "557", "566", "700",
  "116", "224", "233", "288", "440", "477", "558", "800", "990",
  "117", "144", "199", "225", "388", "559", "577", "667", "900"
];

async function initializePannaData<T extends { digit: string }>(
  Model: Model<T>,
  data: string[],
  type: string
) {
  const count = await Model.countDocuments();
  if (count === 0) {
    const pannasToSave = data.map(digit => ({
      digit: digit.toString().padStart(3, '0')
    }));
    await Model.insertMany(pannasToSave);
    console.log(`Successfully initialized ${type} Panna database`);
  }
}

export async function GET() {
  try {
    await connectDB();
    await initializePannaData(DoublePanna, DP_PANA_DATA, "Double");

    const allDigits = await DoublePanna.find({}).sort({ digit: 1 });

    return NextResponse.json({
      status: true,
      message: "Double Panna retrieved successfully",
      data: allDigits
    });

  } catch (error: unknown) {
    console.error('Error in allDoublePanna:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve double panna'
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}
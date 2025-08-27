import { NextResponse } from 'next/server';
import SinglePanna from '@/models/SinglePanna';
import connectDB from '@/config/db';
import { Model } from 'mongoose';

const SP_PANA_DATA = [
  "127", "136", "145", "190", "235", "280", "370", "389", "460", "479", "569", "578",
  "128", "137", "146", "236", "245", "290", "380", "470", "489", "560", "579", "678",
  "129", "138", "147", "156", "237", "246", "345", "390", "480", "570", "589", "679",
  "120", "139", "148", "157", "238", "247", "256", "346", "490", "580", "670", "689",
  "130", "149", "158", "167", "239", "248", "257", "347", "356", "590", "680", "789",
  "140", "159", "168", "230", "249", "258", "267", "348", "357", "456", "690", "780",
  "123", "150", "169", "178", "240", "259", "268", "349", "358", "367", "457", "790",
  "124", "160", "278", "179", "250", "269", "340", "359", "368", "458", "467", "890",
  "125", "134", "170", "189", "260", "279", "350", "369", "468", "378", "459", "567",
  "126", "135", "180", "234", "270", "289", "360", "379", "450", "469", "478", "568"
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
    await initializePannaData(SinglePanna, SP_PANA_DATA, "Single");
    
    const allDigits = await SinglePanna.find({}).sort({ digit: 1 });

    return NextResponse.json({
      status: true,
      message: "Single Panna retrieved successfully",
      data: allDigits
    });

  } catch (error: unknown) {
    console.error('Error in allSinglePanna:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve single panna'
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import SinglePanna from '@/models/SinglePanna';
import DoublePanna from '@/models/DoublePanna';
import TriplePanna from '@/models/TriplePanna';
import connectDB from '@/config/db';

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

const TP_PANA_DATA = ["000", "111", "222", "333", "444", "555", "666", "777", "888", "999"];

async function initializePannaData(Model: any, data: string[], type: string) {
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

    // Initialize all panna types if needed
    await initializePannaData(SinglePanna, SP_PANA_DATA, "Single");
    await initializePannaData(DoublePanna, DP_PANA_DATA, "Double");

    // For triple panna, we'll recreate it each time to ensure consistency
    await TriplePanna.deleteMany({});
    const tripleDigitsToSave = TP_PANA_DATA.map(digit => ({ digit }));
    await TriplePanna.insertMany(tripleDigitsToSave);

    // Fetch all panna types
    const [singlePanna, doublePanna, triplePanna] = await Promise.all([
      SinglePanna.find({}).sort({ digit: 1 }),
      DoublePanna.find({}).sort({ digit: 1 }),
      TriplePanna.find({}).sort({ digit: 1 })
    ]);

    const allPanna = [...singlePanna, ...doublePanna, ...triplePanna]

    return NextResponse.json({
      status: true,
      message: "All Panna types retrieved successfully",
      data: allPanna
    });

  } catch (error: unknown) {
    console.error('Error in allPannaSingleDoubleTriple:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve all panna types'
    return NextResponse.json(
      { status: false, message: errorMessage },
    );
  }
}
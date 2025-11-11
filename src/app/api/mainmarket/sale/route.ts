import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import MainMarketBid from '@/models/MainMarketBid';
import mongoose, { Types, PipelineStage } from 'mongoose';
import SinglePanna from '@/models/SinglePanna';
import DoublePanna from '@/models/DoublePanna';
import TriplePanna from '@/models/TriplePanna';
import MainMarketResult from '@/models/MainMarketResult';

interface MatchConditions {
  'bids.game_type': string;
  created_at?: {
    $gte: Date;
    $lte: Date;
  };
  'bids.game_id'?: Types.ObjectId;
  'bids.session'?: string;
}

interface DigitReportItem {
  digit: string;
  point: number;
}

interface GameTypeResult {
  [key: string]: DigitReportItem[];
}

interface PannaDocument {
  digit: string | number;
}

interface DeclaredDigits {
  openDigit?: string;
  closeDigit?: string;
}

interface ResponseData {
  status: boolean;
  message: string;
  declaredDigits?: DeclaredDigits;
  [key: string]: DigitReportItem[] | boolean | string | DeclaredDigits | undefined;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { bid_date, game_id, game_type, session } = body;

    if (!game_type) {
      return NextResponse.json(
        { status: false, message: 'game_type is required' },
        { status: 400 }
      );
    }

    const validGameTypes = [
      'single-digit',
      'single-panna',
      'double-panna',
      'triple-panna',
      'sp-motor',
      'dp-motor',
      'sp-dp-tp-motor',
      'odd-even',
      'two-digit',
      'choice-panna',
      'digit-base-jodi',
      'full-sangam',
      'half-sangam',
      'jodi-digit',
      'red-bracket',
      'all'
    ];

    if (!validGameTypes.includes(game_type)) {
      return NextResponse.json(
        { status: false, message: 'Invalid game_type provided' },
        { status: 400 }
      );
    }

    const sessionRequiredGameTypes = [
      'single-digit',
      'single-panna',
      'double-panna',
      'triple-panna',
      'sp-motor',
      'dp-motor',
      'sp-dp-tp-motor',
      'odd-even',
      'two-digit',
      'choice-panna',
      'half-sangam',
      'all'
    ];

    if (sessionRequiredGameTypes.includes(game_type)) {
      if (!session) {
        return NextResponse.json(
          { status: false, message: 'Session is required for this game type' },
          { status: 400 }
        );
      }
      if (!['open', 'close'].includes(session.toLowerCase())) {
        return NextResponse.json(
          { status: false, message: 'Session must be either "open" or "close"' },
          { status: 400 }
        );
      }
    }

    // Function to get declared result for the date and game
    const getDeclaredResult = async (): Promise<DeclaredDigits | undefined> => {
      if (!bid_date || !game_id) return undefined;

      try {
        const resultDate = new Date(bid_date);
        const formattedDate = `${String(resultDate.getDate()).padStart(2, '0')}-${String(resultDate.getMonth() + 1).padStart(2, '0')}-${resultDate.getFullYear()}`;

        const results = await MainMarketResult.find({
          result_date: formattedDate,
          game_id: new mongoose.Types.ObjectId(game_id)
        });

        if (results.length === 0) return undefined;

        const openResult = results.find(r => r.session === 'open');
        const closeResult = results.find(r => r.session === 'close');

        return {
          openDigit: openResult?.digit,
          closeDigit: closeResult?.digit
        };
      } catch (error) {
        console.error('Error fetching declared result:', error);
        return undefined;
      }
    };

    // Function to get jodi range based on matched jodi
    const getJodiRange = (jodi: string): string[] => {
      if (!jodi || jodi.length !== 2) return [];
      
      const firstDigit = jodi[0];
      const jodis: string[] = [];
      
      // Generate all jodis from firstDigit + 0 to firstDigit + 9
      for (let i = 0; i <= 9; i++) {
        jodis.push(`${firstDigit}${i}`);
      }
      
      return jodis;
    };

    // Function to filter and sort jodi-based data based on declared result
    const filterJodiBasedByDeclaredResult = (digitReport: DigitReportItem[], allDigits: DigitReportItem[], declaredResult?: DeclaredDigits): DigitReportItem[] => {
      if (!declaredResult?.openDigit || !declaredResult?.closeDigit) {
        // If no declared result, return all digits with 0 points
        return allDigits.map(digitItem => ({
          ...digitItem,
          point: 0
        }));
      }

      const winningJodi = declaredResult.openDigit + declaredResult.closeDigit;
      const jodiRange = getJodiRange(winningJodi);
      
      // Filter digitReport to only include jodis in the matching range
      const filteredReport = digitReport.filter(item => 
        jodiRange.includes(item.digit)
      );
      
      // Create result with all jodis in range, including those with 0 points
      const result = jodiRange.map(jodi => {
        const existingItem = filteredReport.find(item => item.digit === jodi);
        return {
          digit: jodi,
          point: existingItem?.point || 0
        };
      });
      
      // Sort by point (highest first) and then by digit
      result.sort((a, b) => {
        if (b.point !== a.point) {
          return b.point - a.point;
        }
        return a.digit.localeCompare(b.digit);
      });
      
      return result;
    };

    const getDigitReport = async (type: string, sess?: string): Promise<DigitReportItem[]> => {
      const matchConditions: MatchConditions = {
        'bids.game_type': type
      };

      if (bid_date) {
        const startDate = new Date(bid_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(bid_date);
        endDate.setHours(23, 59, 59, 999);

        matchConditions.created_at = {
          $gte: startDate,
          $lte: endDate
        };
      }

      if (game_id) {
        matchConditions['bids.game_id'] = new mongoose.Types.ObjectId(game_id);
      }

      const sessionLessGameTypes = [
        'full-sangam',
        'half-sangam',
        'jodi-digit',
        'red-bracket',
        'digit-base-jodi'
      ];

      if (sess && !sessionLessGameTypes.includes(type)) {
        matchConditions['bids.session'] = sess.toLowerCase();
      }

      const aggregationPipeline: PipelineStage[] = [
        { $match: matchConditions },
        { $unwind: '$bids' },
        { $match: matchConditions }
      ];

      if (type === 'full-sangam') {
        aggregationPipeline.push(
          {
            $group: {
              _id: {
                openPanna: '$bids.open_panna',
                closePanna: '$bids.close_panna'
              },
              totalPoints: { $sum: '$bids.bid_amount' }
            }
          },
          {
            $project: {
              digit: {
                $concat: [
                  { $ifNull: ['$_id.openPanna', ''] },
                  '-',
                  { $ifNull: ['$_id.closePanna', ''] }
                ]
              },
              point: '$totalPoints',
              _id: 0
            }
          }
        );
      } else if (type === 'half-sangam') {
        aggregationPipeline.push(
          {
            $group: {
              _id: {
                digit: '$bids.digit',
                openPanna: '$bids.open_panna',
                closePanna: '$bids.close_panna',
                session: '$bids.session'
              },
              totalPoints: { $sum: '$bids.bid_amount' }
            }
          },
          {
            $project: {
              digit: {
                $cond: [
                  { $eq: ['$_id.session', 'open'] },
                  {
                    $concat: [
                      { $toString: '$_id.digit' },
                      '-',
                      { $ifNull: ['$_id.closePanna', ''] }
                    ]
                  },
                  {
                    $concat: [
                      { $toString: '$_id.digit' },
                      '-',
                      { $ifNull: ['$_id.openPanna', ''] }
                    ]
                  }
                ]
              },
              point: '$totalPoints',
              _id: 0
            }
          }
        );
      } else {
        let groupField: string;
        switch (type) {
          case 'single-digit':
          case 'odd-even':
            groupField = '$bids.digit';
            break;
          case 'digit-base-jodi':
          case 'jodi-digit':
          case 'red-bracket':
            groupField = '$bids.digit';
            break;
          case 'single-panna':
          case 'double-panna':
          case 'triple-panna':
          case 'sp-motor':
          case 'dp-motor':
          case 'sp-dp-tp-motor':
          case 'two-digit':
          case 'choice-panna':
            groupField = '$bids.panna';
            break;
          default:
            groupField = '$bids.digit';
        }

        aggregationPipeline.push(
          {
            $group: {
              _id: groupField,
              totalPoints: { $sum: '$bids.bid_amount' }
            }
          },
          {
            $project: {
              digit: { $toString: '$_id' },
              point: '$totalPoints',
              _id: 0
            }
          }
        );
      }

      const digitReport = await MainMarketBid.aggregate(aggregationPipeline);
      return digitReport;
    };

    const initializeAllDigits = async (type: string): Promise<DigitReportItem[]> => {
      const getFormattedDigits = async (model: typeof SinglePanna | typeof DoublePanna | typeof TriplePanna): Promise<DigitReportItem[]> => {
        const digits = await model.find({}, { digit: 1, _id: 0 });
        return digits.map((p: PannaDocument) => ({
          digit: p.digit.toString(),
          point: 0
        }));
      };

      switch (type) {
        case 'single-digit':
        case 'odd-even':
          return Array.from({ length: 10 }, (_, i) => ({
            digit: i.toString(),
            point: 0
          }));
        case 'jodi-digit':
        case 'red-bracket':
        case 'digit-base-jodi':
          return Array.from({ length: 100 }, (_, i) => ({
            digit: i.toString().padStart(2, '0'),
            point: 0
          }));
        case 'single-panna':
        case 'sp-motor':
          return await getFormattedDigits(SinglePanna);
        case 'double-panna':
        case 'dp-motor':
          return await getFormattedDigits(DoublePanna);
        case 'triple-panna':
          return await getFormattedDigits(TriplePanna);
        case 'sp-dp-tp-motor':
        case 'two-digit':
        case 'choice-panna':
          const singlePannas = await getFormattedDigits(SinglePanna);
          const doublePannas = await getFormattedDigits(DoublePanna);
          const triplePannas = await getFormattedDigits(TriplePanna);
          const combinedPannas = [...singlePannas, ...doublePannas, ...triplePannas];
          const uniqueDigitsMap = new Map();
          combinedPannas.forEach(item => {
            uniqueDigitsMap.set(item.digit, item);
          });
          return Array.from(uniqueDigitsMap.values());
        case 'half-sangam':
        case 'full-sangam':
          return [];
        default:
          return [];
      }
    };

    const processDigitReport = async (type: string, digitReport: DigitReportItem[], allDigits: DigitReportItem[], declaredResult?: DeclaredDigits): Promise<DigitReportItem[]> => {
      // Special handling only for jodi-based games when session is close
      const jodiBasedGames = ['jodi-digit', 'red-bracket', 'digit-base-jodi'];
      
      if (jodiBasedGames.includes(type) && session === 'close') {
        return filterJodiBasedByDeclaredResult(digitReport, allDigits, declaredResult);
      }

      if (type === 'full-sangam' || type === 'half-sangam') {
        const filteredReport = digitReport.filter(item =>
          item.digit && item.point > 0
        );
        filteredReport.sort((a, b) => b.point - a.point || a.digit.localeCompare(b.digit));
        return filteredReport;
      }

      const digitPointMap: { [key: string]: number } = {};
      digitReport.forEach(item => {
        if (item.digit) digitPointMap[item.digit] = item.point;
      });

      const result = allDigits.map(digitItem => ({
        ...digitItem,
        point: digitPointMap[digitItem.digit] || 0
      }));

      // Sort by point (highest first) and then by digit
      result.sort((a, b) => {
        if (b.point !== a.point) {
          return b.point - a.point;
        }
        
        if (!isNaN(Number(a.digit)) && !isNaN(Number(b.digit))) {
          return Number(a.digit) - Number(b.digit);
        }
        return a.digit.localeCompare(b.digit);
      });

      return result;
    };

    // Get declared result for the date and game
    const declaredResult = await getDeclaredResult();

    if (game_type === 'all') {
      const gameTypesToProcess = [
        'single-digit',
        'single-panna',
        'double-panna',
        'triple-panna',
        'sp-motor',
        'dp-motor',
        'sp-dp-tp-motor',
        'odd-even',
        'two-digit',
        'choice-panna',
        'digit-base-jodi',
        'full-sangam',
        'half-sangam',
        'jodi-digit',
        'red-bracket'
      ];

      const result: GameTypeResult = {};

      for (const type of gameTypesToProcess) {
        let digitReport: DigitReportItem[] = [];

        if (['full-sangam', 'half-sangam', 'jodi-digit', 'red-bracket', 'digit-base-jodi'].includes(type)) {
          digitReport = await getDigitReport(type);
        } else {
          digitReport = await getDigitReport(type, session);
        }

        const allDigits = await initializeAllDigits(type);
        
        let processedReport: DigitReportItem[] = [];
        
        // Special handling only for jodi-based games when session is close
        const jodiBasedGames = ['jodi-digit', 'red-bracket', 'digit-base-jodi'];
        if (jodiBasedGames.includes(type) && session === 'close') {
          processedReport = filterJodiBasedByDeclaredResult(digitReport, allDigits, declaredResult);
        } else {
          processedReport = await processDigitReport(type, digitReport, allDigits, declaredResult);
        }

        const resultKeyMap: Record<string, string> = {
          'single-digit': 'singleDigitBid',
          'single-panna': 'singlePannaBid',
          'double-panna': 'doublePannaBid',
          'triple-panna': 'triplePannaBid',
          'sp-motor': 'spMotor',
          'dp-motor': 'dpMotor',
          'sp-dp-tp-motor': 'spdptpMotor',
          'odd-even': 'oddEven',
          'two-digit': 'twoDigit',
          'choice-panna': 'choicePanna',
          'digit-base-jodi': 'digitBaseJodi',
          'full-sangam': 'fullSangamBid',
          'half-sangam': 'halfSangamBid',
          'jodi-digit': 'jodiBid',
          'red-bracket': 'redBreaket'
        };

        result[resultKeyMap[type]] = processedReport;
      }

      // Add declared digits to response when session is close
      if (session === 'close' && declaredResult) {
        return NextResponse.json({
          status: true,
          message: 'Sale report generated successfully',
          declaredDigits: {
            openDigit: declaredResult.openDigit,
            closeDigit: declaredResult.closeDigit
          },
          ...result
        });
      }

      return NextResponse.json({
        status: true,
        message: 'Sale report generated successfully',
        ...result
      });
    }

    // Handle single-type request
    let digitReport: DigitReportItem[] = [];
    if (['full-sangam', 'half-sangam', 'jodi-digit', 'red-bracket', 'digit-base-jodi'].includes(game_type)) {
      digitReport = await getDigitReport(game_type);
    } else {
      digitReport = await getDigitReport(game_type, session);
    }

    const allDigits = await initializeAllDigits(game_type);
    
    let processedReport: DigitReportItem[] = [];
    
    // Special handling only for jodi-based games when session is close
    const jodiBasedGames = ['jodi-digit', 'red-bracket', 'digit-base-jodi'];
    if (jodiBasedGames.includes(game_type) && session === 'close') {
      processedReport = filterJodiBasedByDeclaredResult(digitReport, allDigits, declaredResult);
    } else {
      processedReport = await processDigitReport(game_type, digitReport, allDigits, declaredResult);
    }

    const resultKeyMap: Record<string, string> = {
      'single-digit': 'singleDigitBid',
      'single-panna': 'singlePannaBid',
      'double-panna': 'doublePannaBid',
      'triple-panna': 'triplePannaBid',
      'sp-motor': 'spMotor',
      'dp-motor': 'dpMotor',
      'sp-dp-tp-motor': 'spdptpMotor',
      'odd-even': 'oddEven',
      'two-digit': 'twoDigit',
      'choice-panna': 'choicePanna',
      'digit-base-jodi': 'digitBaseJodi',
      'full-sangam': 'fullSangamBid',
      'half-sangam': 'halfSangamBid',
      'jodi-digit': 'jodiBid',
      'red-bracket': 'redBreaket'
    };

    // Prepare response with proper typing
    const responseData: ResponseData = {
      status: true,
      message: 'Sale report generated successfully',
      [resultKeyMap[game_type]]: processedReport
    };

    // Add declared digits to response when session is close for jodi-based games or all game types
    const jodiBasedOrAll = [...jodiBasedGames, 'all'];
    if (jodiBasedOrAll.includes(game_type) && session === 'close' && declaredResult) {
      responseData.declaredDigits = {
        openDigit: declaredResult.openDigit,
        closeDigit: declaredResult.closeDigit
      };
    }

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error('Error generating sale report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate sale report';
    return NextResponse.json({ status: false, message: errorMessage });
  }
}
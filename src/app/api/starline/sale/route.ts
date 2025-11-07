import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import StarlineBid from '@/models/StarlineBid';
import mongoose, { Types, PipelineStage } from 'mongoose';
import SinglePanna from '@/models/SinglePanna';
import DoublePanna from '@/models/DoublePanna';
import TriplePanna from '@/models/TriplePanna';

// Define types for the aggregation match conditions
interface MatchConditions {
    'bids.game_type': string;
    created_at?: {
        $gte: Date;
        $lte: Date;
    };
    'bids.game_id'?: Types.ObjectId;
}

// Define types for the digit report
interface DigitReportItem {
    digit: string;
    point: number;
}

interface GameTypeResult {
    [key: string]: DigitReportItem[];
}

// Define types for model documents
interface PannaDocument {
    digit: string | number;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { bid_date, game_id, game_type } = body;

        // Validate required parameters
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
            'all'
        ];

        if (!validGameTypes.includes(game_type)) {
            return NextResponse.json(
                { status: false, message: 'Invalid game_type provided' },
                { status: 400 }
            );
        }

        // Function to get digit report for a specific game type (including all digits with 0 amounts)
        const getDigitReport = async (type: string): Promise<DigitReportItem[]> => {
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

            let groupField: string;
            switch (type) {
                case 'single-digit':
                    groupField = '$bids.digit';
                    break;
                case 'single-panna':
                case 'double-panna':
                case 'triple-panna':
                    groupField = '$bids.panna';
                    break;
                default:
                    groupField = '$bids.digit';
            }

            const aggregationPipeline: PipelineStage[] = [
                { $match: matchConditions },
                { $unwind: '$bids' },
                { $match: { 
                    'bids.game_type': type
                }},
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
            ];

            const digitReport = await StarlineBid.aggregate(aggregationPipeline);
            return digitReport;
        };

        // Function to initialize all digits for a game type
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
                    return Array.from({ length: 10 }, (_, i) => ({
                        digit: i.toString(),
                        point: 0
                    }));
                case 'single-panna':
                    return await getFormattedDigits(SinglePanna);
                case 'double-panna':
                    return await getFormattedDigits(DoublePanna);
                case 'triple-panna':
                    return await getFormattedDigits(TriplePanna);
                default:
                    return [];
            }
        };

        // Function to process and merge digit reports - UPDATED SORTING
        const processDigitReport = async (type: string, digitReport: DigitReportItem[], allDigits: DigitReportItem[]): Promise<DigitReportItem[]> => {
            // Create a map of digit to points from the actual bid data
            const digitPointMap: { [key: string]: number } = {};
            digitReport.forEach(item => {
                if (item.digit !== null && item.digit !== undefined && item.digit !== '') {
                    digitPointMap[item.digit] = item.point;
                }
            });

            // Merge with all possible digits, using actual points where available, otherwise 0
            const result = allDigits.map(digitItem => ({
                ...digitItem,
                point: digitPointMap[digitItem.digit] || 0
            }));

            // UPDATED: Sort by point in descending order (highest first), then by digit for ties
            result.sort((a, b) => {
                if (b.point !== a.point) {
                    return b.point - a.point; // Higher points first
                }
                
                // If points are equal, sort by digit
                if (!isNaN(Number(a.digit)) && !isNaN(Number(b.digit))) {
                    return Number(a.digit) - Number(b.digit);
                }
                return a.digit.localeCompare(b.digit);
            });

            return result;
        };

        // Handle case when game_type is 'all'
        if (game_type === 'all') {
            const gameTypesToProcess = [
                'single-digit',
                'single-panna',
                'double-panna',
                'triple-panna'
            ];

            const result: GameTypeResult = {};

            // Process each game type
            for (const type of gameTypesToProcess) {
                const digitReport = await getDigitReport(type);
                const allDigits = await initializeAllDigits(type);
                const processedReport = await processDigitReport(type, digitReport, allDigits);

                // Map game types to their result keys
                const resultKeyMap: Record<string, string> = {
                    'single-digit': 'singleDigitBid',
                    'single-panna': 'singlePannaBid',
                    'double-panna': 'doublePannaBid',
                    'triple-panna': 'triplePannaBid'
                };

                result[resultKeyMap[type]] = processedReport;
            }

            return NextResponse.json({
                status: true,
                message: 'Starline sale report generated successfully',
                ...result
            });
        }

        // Handle single game type case
        const digitReport = await getDigitReport(game_type);
        const allDigits = await initializeAllDigits(game_type);
        const processedReport = await processDigitReport(game_type, digitReport, allDigits);

        // Map single game type to its result key
        const resultKeyMap: Record<string, string> = {
            'single-digit': 'singleDigitBid',
            'single-panna': 'singlePannaBid',
            'double-panna': 'doublePannaBid',
            'triple-panna': 'triplePannaBid'
        };

        const result = {
            status: true,
            message: 'Starline sale report generated successfully',
            [resultKeyMap[game_type]]: processedReport
        };

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error('Error generating starline sale report:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate starline sale report';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}
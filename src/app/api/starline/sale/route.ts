import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import StarlineBid from '@/models/StarlineBid';
import mongoose, { Types } from 'mongoose';

// Define types for the aggregation match conditions
interface MatchConditions {
    'bids.game_type': string;
    'bids.bid_amount': { $gt: number };
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

        // Function to get digit report for a specific game type (only where amount > 0)
        const getDigitReport = async (type: string): Promise<DigitReportItem[]> => {
            const matchConditions: MatchConditions = {
                'bids.game_type': type,
                'bids.bid_amount': { $gt: 0 } // Only include bids with amount > 0
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

            const digitReport = await StarlineBid.aggregate([
                { $match: matchConditions as any }, // Cast to any for MongoDB aggregation
                { $unwind: '$bids' },
                { $match: { 
                    'bids.game_type': type,
                    'bids.bid_amount': { $gt: 0 }
                }},
                {
                    $group: {
                        _id: '$bids.digit',
                        totalPoints: { $sum: '$bids.bid_amount' }
                    }
                },
                { $match: { totalPoints: { $gt: 0 } } }, // Only include groups with total points > 0
                {
                    $project: {
                        digit: { $toString: '$_id' },
                        point: '$totalPoints',
                        _id: 0
                    }
                }
            ]);

            return digitReport;
        };

        // Function to process and merge digit reports (simplified since we only have non-zero data)
        const processDigitReport = async (type: string, digitReport: DigitReportItem[]): Promise<DigitReportItem[]> => {
            // Filter out any null or undefined digits
            const filteredReport = digitReport.filter(item => 
                item.digit !== null && item.digit !== undefined && item.digit !== ''
            );

            // Sort the results
            filteredReport.sort((a, b) => {
                if (!isNaN(Number(a.digit)) && !isNaN(Number(b.digit))) {
                    return Number(a.digit) - Number(b.digit);
                }
                return a.digit.localeCompare(b.digit);
            });

            return filteredReport;
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

            // Process each game type in parallel
            await Promise.all(gameTypesToProcess.map(async (type) => {
                const digitReport = await getDigitReport(type);
                const processedReport = await processDigitReport(type, digitReport);

                // Only add to result if there are non-zero entries
                if (processedReport.length > 0) {
                    // Map game types to their result keys
                    const resultKeyMap: Record<string, string> = {
                        'single-digit': 'singleDigitBid',
                        'single-panna': 'singlePannaBid',
                        'double-panna': 'doublePannaBid',
                        'triple-panna': 'triplePannaBid'
                    };

                    result[resultKeyMap[type]] = processedReport;
                }
            }));

            return NextResponse.json({
                status: true,
                message: 'Starline sale report generated successfully',
                ...result
            });
        }

        // Handle single game type case
        const digitReport = await getDigitReport(game_type);
        const processedReport = await processDigitReport(game_type, digitReport);

        // Only return if there are non-zero entries
        if (processedReport.length === 0) {
            return NextResponse.json({
                status: true,
                message: 'No starline sale data found for the selected criteria'
            });
        }

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
            { status: false, message: errorMessage },
            { status: 500 }
        );
    }
}
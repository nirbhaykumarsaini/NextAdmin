import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import GalidisawarBid from '@/models/GalidisawarBid';
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
            'left-digit',
            'right-digit',
            'jodi-digit',
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

            const digitReport = await GalidisawarBid.aggregate([
                { $match: matchConditions as any }, // Cast to any for MongoDB aggregation
                { $unwind: '$bids' },
                {
                    $match: {
                        'bids.game_type': type,
                        'bids.bid_amount': { $gt: 0 }
                    }
                },
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

        // Function to initialize all digits for a game type
        const initializeAllDigits = (type: string): DigitReportItem[] => {
            switch (type) {
                case 'left-digit':
                case 'right-digit':
                    return Array.from({ length: 10 }, (_, i) => ({
                        digit: i.toString(),
                        point: 0
                    }));
                case 'jodi-digit':
                    return Array.from({ length: 100 }, (_, i) => ({
                        digit: i.toString().padStart(2, '0'),
                        point: 0
                    }));
                default:
                    return [];
            }
        };

        // Handle case when game_type is 'all'
        if (game_type === 'all') {
            const gameTypesToProcess = [
                'left-digit',
                'right-digit',
                'jodi-digit'
            ];

            const result: GameTypeResult = {};

            // Process each game type in parallel
            await Promise.all(gameTypesToProcess.map(async (type) => {
                const digitReport = await getDigitReport(type);
                const allDigits = initializeAllDigits(type);
                
                // Create a map of all possible digits with their points
                const digitPointMap: Record<string, number> = {};
                allDigits.forEach(item => {
                    digitPointMap[item.digit] = 0;
                });
                
                // Update the map with actual points from the report
                digitReport.forEach(item => {
                    if (item.digit !== null && item.digit !== undefined) {
                        digitPointMap[item.digit] = item.point;
                    }
                });

                // Convert back to array and filter out zero points if needed
                const processedReport = Object.entries(digitPointMap)
                    .map(([digit, point]) => ({ digit, point }))
                    .filter(item => item.point > 0)
                    .sort((a, b) => {
                        if (!isNaN(Number(a.digit)) && !isNaN(Number(b.digit))) {
                            return Number(a.digit) - Number(b.digit);
                        }
                        return a.digit.localeCompare(b.digit);
                    });

                // Only add to result if there are non-zero entries
                if (processedReport.length > 0) {
                    // Map game types to their result keys
                    const resultKeyMap: Record<string, string> = {
                        'left-digit': 'leftDigitBid',
                        'right-digit': 'rightDigitBid',
                        'jodi-digit': 'jodiDigitBid'
                    };

                    result[resultKeyMap[type]] = processedReport;
                }
            }));

            return NextResponse.json({
                status: true,
                message: 'Galidisawar sale report generated successfully',
                ...result
            });
        }

        // Handle single game type case
        const digitReport = await getDigitReport(game_type);
        const allDigits = initializeAllDigits(game_type);
        
        // Create a map of all possible digits with their points
        const digitPointMap: Record<string, number> = {};
        allDigits.forEach(item => {
            digitPointMap[item.digit] = 0;
        });
        
        // Update the map with actual points from the report
        digitReport.forEach(item => {
            if (item.digit !== null && item.digit !== undefined) {
                digitPointMap[item.digit] = item.point;
            }
        });

        // Convert back to array and filter out zero points
        const processedReport = Object.entries(digitPointMap)
            .map(([digit, point]) => ({ digit, point }))
            .filter(item => item.point > 0)
            .sort((a, b) => {
                if (!isNaN(Number(a.digit)) && !isNaN(Number(b.digit))) {
                    return Number(a.digit) - Number(b.digit);
                }
                return a.digit.localeCompare(b.digit);
            });

        // Only return if there are non-zero entries
        if (processedReport.length === 0) {
            return NextResponse.json({
                status: true,
                message: 'No galidisawar sale data found for the selected criteria'
            });
        }

        // Map single game type to its result key
        const resultKeyMap: Record<string, string> = {
            'left-digit': 'leftDigitBid',
            'right-digit': 'rightDigitBid',
            'jodi-digit': 'jodiDigitBid'
        };

        const result = {
            status: true,
            message: 'Galidisawar sale report generated successfully',
            [resultKeyMap[game_type]]: processedReport
        };

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error('Error generating galidisawar sale report:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate galidisawar sale report';
        return NextResponse.json(
            { status: false, message: errorMessage },
            { status: 500 }
        );
    }
}
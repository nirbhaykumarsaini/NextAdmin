import connectDB from "@/config/db";
import MainMarketResult from "@/models/MainMarketResult";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// For strongly typed session results
interface SessionResult {
    panna: string;
    digit: string;
}

interface GroupedResult {
    result_date: string;
    game_name: string;
    openSession: SessionResult | null;
    closeSession: SessionResult | null;
}

interface MainMarketResultDocument {
    result_date: string;
    game_id: { game_name: string };
    session: string;
    panna: string;
    digit: string;
    _id: Types.ObjectId;
    created_at?: Date;
    updated_at?: Date;
}

// ✅ Accept route params correctly
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ game_id: string }> }
) {
    try {
        await connectDB();

        const { game_id } = await params;

        // Query results for this game_id
        const results = await MainMarketResult.find({ game_id })
            .sort({ result_date: -1, createdAt: -1 })
            .populate("game_id", "game_name") as unknown as MainMarketResultDocument[];

        // Group results by date and game
        const groupedResults = results.reduce((acc: Record<string, GroupedResult>, result) => {
            const key = `${result.result_date}-${result.game_id.game_name}`;

            if (!acc[key]) {
                acc[key] = {
                    result_date: result.result_date,
                    game_name: result.game_id.game_name,
                    openSession: {
                        panna: "***",
                        digit: "*"
                    },
                    closeSession: {
                        panna: "***",
                        digit: "*"
                    },
                };
            }

            if (result.session === "Open") {
                acc[key].openSession = {
                    panna: result.panna,
                    digit: result.digit
                };
            } else if (result.session === "Close") {
                acc[key].closeSession = {
                    panna: result.panna,
                    digit: result.digit
                };
            }

            return acc;
        }, {});

        return NextResponse.json({
            status: true,
            data: Object.values(groupedResults),
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to retrieve results";
        return NextResponse.json({ status: false, message: errorMessage });
    }
}

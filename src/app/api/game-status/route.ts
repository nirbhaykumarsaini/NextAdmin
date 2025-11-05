import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import GameSettings from "@/models/GameSettings"

const MONGO_URI = process.env.MONGO_URI!

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI)
    }
}

// ✅ GET API — fetch current game statuses
export async function GET() {
    try {
        await connectDB()
        const settings = await GameSettings.findOne()

        // If not exists, create default one
        if (!settings) {
            const newSettings = await GameSettings.create({
                galidisawar: false,
                starline: false,
            })
            return NextResponse.json({ status: true, data: newSettings })
        }

        return NextResponse.json({ status: true, data: settings })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: false, message: error.message || "error fetching game statuses" }
            )
        }
    }
}

// ✅ POST API — update single game status
export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const { game, enabled } = await req.json()

        if (!["galidisawar", "starline"].includes(game)) {
            return NextResponse.json({ status: false, message: "Invalid game type" })
        }

        const update = await GameSettings.findOneAndUpdate(
            {},
            { [game]: enabled },
            { upsert: true, new: true }
        )

        return NextResponse.json({
            status: true,
            message: `${game} updated successfully`,
            data: update,
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: false, message: error.message || "error updating game statuses" }
            )
        }
    }
}

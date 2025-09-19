import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import '@/models/StarlineGame'

export interface IStarlineResult extends Document {
    result_date: string;
    game_id: Types.ObjectId;
    panna: string;
    digit: string;
    created_at?: Date;
    updated_at?: Date;
}

const starlineResultSchema: Schema = new Schema(
    {
        result_date: {
            type: String,
            required: [true, "Date is required"],
            match: [/^\d{2}-\d{2}-\d{4}$/, "Date must be in DD-MM-YYYY format"]
        },
        game_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StarlineGame",
            required: [true, "Game ID is required"]
        },
        panna: {
            type: String,
            required: [true, "Panna is required"],
            match: [/^\d{3}$/, "Panna must be a 3-digit number"]
        },
        digit: {
            type: String,
            required: [true, "Digit is required"],
            match: [/^\d{1}$/, "Digit must be a single digit"]
        }
    },
    { timestamps: true }
);


const StarlineResult: Model<IStarlineResult> = mongoose.models.StarlineResult ||
    mongoose.model<IStarlineResult>('StarlineResult', starlineResultSchema);

export default StarlineResult;
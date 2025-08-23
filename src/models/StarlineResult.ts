import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStarlineResult extends Document {
    result_date: string;
    game_name: string;
    panna: string;
    digit: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const starlineResultSchema: Schema = new Schema(
    {
        result_date: {
            type: String,
            required: [true, "Date is required"],
            match: [/^\d{2}-\d{2}-\d{4}$/, "Date must be in DD-MM-YYYY format"]
        },
        game_name: {
            type: String,
            required: [true, "Game name is required"]
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

// Create compound index to prevent duplicate results for same date, game, and session
starlineResultSchema.index({ result_date: 1, game_name: 1 }, { unique: true });

const StarlineResult: Model<IStarlineResult> = mongoose.models.StarlineResult || 
    mongoose.model<IStarlineResult>('StarlineResult', starlineResultSchema);

export default StarlineResult;
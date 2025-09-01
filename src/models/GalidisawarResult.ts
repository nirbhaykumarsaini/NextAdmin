import mongoose, { Document, Model, Schema } from 'mongoose';
import '@/models/GalidisawarGame'

export interface IGalidisawarResult extends Document {
    result_date: string;
    game_id: string;
    digit: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const galidisawarResultSchema: Schema = new Schema(
    {
        result_date: {
            type: String,
            required: [true, "Date is required"],
            match: [/^\d{2}-\d{2}-\d{4}$/, "Date must be in DD-MM-YYYY format"]
        },
        game_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GalidisawarGame",
            required: [true, "Game ID is required"]
        },
        digit: {
            type: String,
            required: [true, "Digit is required"],
            match: [/^\d{2}$/, "Digit must be a single digit"]
        }
    },
    { timestamps: true }
);

// Create compound index to prevent duplicate results for same date, game
galidisawarResultSchema.index({ result_date: 1, game_name: 1 }, { unique: true });

const GalidisawarResult: Model<IGalidisawarResult> = mongoose.models.GalidisawarResult ||
    mongoose.model<IGalidisawarResult>('GalidisawarResult', galidisawarResultSchema);

export default GalidisawarResult;
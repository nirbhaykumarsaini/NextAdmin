import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMainMarketResult extends Document {
    result_date: string;
    game_name: string;
    session: string;
    panna: string;
    digit: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const mainMarketResultSchema: Schema = new Schema(
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
        session: {
            type: String,
            required: [true, "Session is required"],
            enum: {
                values: ['Open', 'Close'],
                message: 'Session must be either Open or Close'
            }
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
mainMarketResultSchema.index({ result_date: 1, game_name: 1, session: 1 }, { unique: true });

const MainMarketResult: Model<IMainMarketResult> = mongoose.models.MainMarketResult || 
    mongoose.model<IMainMarketResult>('MainMarketResult', mainMarketResultSchema);

export default MainMarketResult;
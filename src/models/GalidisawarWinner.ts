import mongoose, { Model, Types } from "mongoose";
import '@/models/AppUser';
import '@/models/GalidisawarGame';
import '@/models/GalidisawarBid'
import '@/models/Transaction';

export interface IGalidisawarWinner extends Document {
    result_date: string;
    winners: [
        {
            user_id: Types.ObjectId;
            user: string;
            game_name: string;
            game_type: string;
            digit?: string;
            winning_amount: number;
            bid_amount: number;
            transaction_id:Types.ObjectId;
        }
    ]
}


const galidisawarWinnerSchema = new mongoose.Schema({
    result_date: {
        type: Date,
        required: [true, "Result date is required"],
    },
    winners: [{
        user: {
            type: String,
            required: true
        },
        user_id: {
            type: Types.ObjectId,
            ref: "AppUser",
            required: true
        },
         transaction_id: {
            type: Types.ObjectId,
            ref: "Transaction",
            required: true
        },
        game_name: {
            type: String,
            required: [true, "Game name is required"]
        },
        game_type: {
            type: String,
            required: [true, "Game type is required"]
        },
        digit: {
            type: String,
            required: true
        },
        winning_amount: {
            type: Number,
            required: true
        },
        bid_amount: {
            type: Number,
            required: true
        },
    }]

}, {
    timestamps: true
});



const GalidisawarWinner: Model<IGalidisawarWinner> = mongoose.models.GalidisawarWinner ||
    mongoose.model<IGalidisawarWinner>('GalidisawarWinner', galidisawarWinnerSchema);

export default GalidisawarWinner;




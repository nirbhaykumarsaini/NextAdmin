import mongoose, { Model, Schema, Types } from "mongoose";
import '@/models/AppUser';
import '@/models/StarlineGame';
import '@/models/StarlineBid'
import '@/models/Transaction';

export interface IStarlineWinner extends Document {
    result_date: string;
    winners: [
        {
            user_id:Types.ObjectId;
            user: string;
            game_name: string;
            game_type: string;
            panna?: string;
            digit?: string;
            winning_amount: number;
            bid_amount: number;
            transaction_id:Types.ObjectId;
        }
    ]
}


const starlineWinnerSchema = new mongoose.Schema({
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
            type: Schema.Types.ObjectId,
            ref: "AppUser",
            required: true
        },
        transaction_id: {
            type: Schema.Types.ObjectId,
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
        panna: {
            type: String,
            // required: true
        },
        digit: {
            type: String,
            // required: true
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



const StarlineWinner: Model<IStarlineWinner> = mongoose.models.StarlineWinner ||
    mongoose.model<IStarlineWinner>('StarlineWinner', starlineWinnerSchema);

export default StarlineWinner;




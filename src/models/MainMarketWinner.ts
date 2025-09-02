import mongoose, { Model, Types } from "mongoose";
import '@/models/AppUser';
import '@/models/MainMarketGame';
import '@/models/MainMarketBid';
import '@/models/Transaction';

export interface IMainMarketWinner extends Document {
    result_date: string;
    winners: [
        {
            user: String;
            game_name: String;
            game_type: String;
            panna?: String;
            digit?:Number;
            session?: String;
            winning_amount: Number;
            bid_amount: Number;
        }
    ]
}


const mainMarketWinnerSchema = new mongoose.Schema({
    result_date: {
        type: Date,
        required: [true, "Result date is required"],
    },
    winners: [{
        user: {
            type: String,
            required: true
        },
        game_name: {
            type: String,
            required: [true, "Game name is required"]
        },
        game_type: {
            type: String,
            required: [true, "Game name is required"]
        },
        panna: {
            type: String,
            // required: true
        },
        digit: {
            type: String,
            // required: true
        },
        session: {
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



const MainMarketWinner: Model<IMainMarketWinner> = mongoose.models.MainMarketWinner ||
    mongoose.model<IMainMarketWinner>('MainMarketWinner', mainMarketWinnerSchema);

export default MainMarketWinner;




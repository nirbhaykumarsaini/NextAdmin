import mongoose, { Model, Types } from "mongoose";
import '@/models/AppUser';
import '@/models/MainMarketGame';
import '@/models/MainMarketBid';
import '@/models/Transaction';

export interface IMainMarketWinner extends Document {
    result_date: string;
    winners:[
        {
            user_id:Types.ObjectId;
            game_id:Types.ObjectId;
            bid_id:Types.ObjectId;
            win_amount:number;
            transaction_id:Types.ObjectId;
        }
    ]
}


const mainMarketWinnerSchema = new mongoose.Schema({
    result_date: {
        type: Date,
        required: [true, "Result date is required"],
    },
    winners: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AppUser",
            required: true
        },
        game_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MainMarketGame",
            required: [true, "Game ID is required"]
        },
        bid_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MainMarketBid",
            required: true
        },
        win_amount: {
            type: Number,
            required: true
        },
        transaction_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        },
    }]

}, {
    timestamps: true
});



const MainMarketWinner: Model<IMainMarketWinner> = mongoose.models.MainMarketWinner || 
    mongoose.model<IMainMarketWinner>('MainMarketWinner', mainMarketWinnerSchema);

export default MainMarketWinner;




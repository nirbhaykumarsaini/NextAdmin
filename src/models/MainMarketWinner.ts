import mongoose, { Document, Model, Schema, Types } from "mongoose";
import "@/models/AppUser";
import "@/models/MainMarketGame";
import "@/models/MainMarketBid";
import "@/models/Transaction";

// Define Winner subdocument interface
export interface IWinner {
  user_id: Types.ObjectId;
  user: string;
  game_name: string;
  game_type: string;
  panna?: string;
  open_panna?: string;
  close_panna?: string;
  digit?: string;
  session?: string;
  winning_amount: number;
  bid_amount: number;
}

// Define main interface
export interface IMainMarketWinner extends Document {
  result_date: Date;
  winners: IWinner[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Winner sub-schema
const winnerSchema = new Schema<IWinner>(
  {
    user_id: {
      type:  Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    game_name: {
      type: String,
      required: [true, "Game name is required"],
    },
    game_type: {
      type: String,
      required: [true, "Game type is required"],
    },
    panna: {
      type: String,
    },
    open_panna: {
      type: String,
    },
    close_panna: {
      type: String,
    },
    digit: {
      type: String,
    },
    session: {
      type: String,
    },
    winning_amount: {
      type: Number,
      required: true,
    },
    bid_amount: {
      type: Number,
      required: true,
    },
  },
  { _id: true } // keep _id for subdocs
);

// Main schema
const mainMarketWinnerSchema = new Schema<IMainMarketWinner>(
  {
    result_date: {
      type: Date,
      required: [true, "Result date is required"],
    },
    winners: [winnerSchema],
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
const MainMarketWinner: Model<IMainMarketWinner> =
  mongoose.models.MainMarketWinner ||
  mongoose.model<IMainMarketWinner>(
    "MainMarketWinner",
    mainMarketWinnerSchema
  );

export default MainMarketWinner;

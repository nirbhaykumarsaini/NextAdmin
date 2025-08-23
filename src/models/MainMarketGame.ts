import mongoose, { Document, Schema } from 'mongoose';

export interface IMainMarketGameDay {
  day: string;
  open_time: string;
  close_time?: string;
  market_status: boolean;
}

export interface IMainMarketGame extends Document {
  _id:string,
  game_name: string;
  is_active: boolean;
  days: IMainMarketGameDay[];
  createdAt: Date;
  updatedAt: Date;
}

const mainMarketGameDaySchema = new Schema<IMainMarketGameDay>({
  day: {
    type: String,
    required: [true, "day is required"],
  },
  open_time: {
    type: String,
    required: [true, "open_time is required"]
  },
  close_time: {
    type: String,
     required: [true, "close_time is required"]
  },
  market_status: {
    type: Boolean,
    required: [true, "market_status is required"],
    default: false
  }
});

const mainMarketGameSchema = new Schema<IMainMarketGame>(
  {
    game_name: {
      type: String,
      trim: true,
      required: [true, "game_name is required"],
      unique: true
    },
    is_active: {
      type: Boolean,
      default: false
    },
    days: [mainMarketGameDaySchema]
  },
  {
    timestamps: true,
  }
);

const MainMarketGame = mongoose.models.MainMarketGame || mongoose.model<IMainMarketGame>('MainMarketGame', mainMarketGameSchema);

export default MainMarketGame;
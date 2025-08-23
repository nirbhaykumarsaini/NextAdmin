import mongoose, { Document, Schema } from 'mongoose';

export interface IStarlineGameDay {
  day: string;
  open_time: string;
  market_status: boolean;
}

export interface IStarlineGame extends Document {
  _id:string;
  game_name: string;
  is_active: boolean;
  days: IStarlineGameDay[];
  createdAt: Date;
  updatedAt: Date;
}

const starlineGameDaySchema = new Schema<IStarlineGameDay>({
  day: {
    type: String,
    required: [true, "day is required"],
  },
  open_time: {
    type: String,
    required: [true, "open_time is required"]
  },
  market_status: {
    type: Boolean,
    required: [true, "market_status is required"],
    default: false
  }
});

const starlineGameSchema = new Schema<IStarlineGame>(
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
    days: [starlineGameDaySchema]
  },
  {
    timestamps: true,
  }
);

const StarlineGame = mongoose.models.StarlineGame || mongoose.model<IStarlineGame>('StarlineGame', starlineGameSchema);

export default StarlineGame;
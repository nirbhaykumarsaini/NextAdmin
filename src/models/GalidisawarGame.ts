import mongoose, { Document, Schema } from 'mongoose';

export interface IGalidisawarGameDay {
  day: string;
  open_time: string;
  market_status: boolean;
}

export interface IGalidisawarGame extends Document {
  _id:string;
  game_name: string;
  is_active: boolean;
  days: IGalidisawarGameDay[];
  createdAt: Date;
  updatedAt: Date;
}

const galidisawarGameDaySchema = new Schema<IGalidisawarGameDay>({
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

const galidisawarGameSchema = new Schema<IGalidisawarGame>(
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
    days: [galidisawarGameDaySchema]
  },
  {
    timestamps: true,
  }
);

const GalidisawarGame = mongoose.models.GalidisawarGame || mongoose.model<IGalidisawarGame>('GalidisawarGame', galidisawarGameSchema);

export default GalidisawarGame;
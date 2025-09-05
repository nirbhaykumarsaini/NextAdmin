import mongoose, { Document, Schema, Types } from 'mongoose';
import '@/models/AppUser'
import '@/models/StarlineGame'


export interface IBid {
  digit?: string;
  bid_amount: number;
  game_id: Types.ObjectId;
  game_type: string;
}

export interface IStarlineBid {
  user_id: Types.ObjectId;
  bids: IBid[];
  total_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface IStarlineBidDocument extends IStarlineBid, Document { }

const bidSchema = new Schema<IBid>({
  digit: {
    type: String,
    validate: {
      validator: function (this: IBid, v: string) {
        // Digit is required for digit-based games in the appropriate session
        const digitGames = ['single-digit', 'single-panna', 'double-panna', 'triple-panna'];

        if (digitGames.includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '';
        }
        return true;
      },
      message: 'Digit is required for this game type'
    }
  },
  bid_amount: {
    type: Number,
    required: true,
  },
  game_id: {
    type: Schema.Types.ObjectId,
    ref: 'StarlineGame',
    required: true,
  },
  game_type: {
    type: String,
    enum: ['single-digit', 'single-panna', 'double-panna', 'triple-panna'],
    required: true
  }
});

const starlineBidSchema = new Schema<IStarlineBidDocument>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true,
  },
  bids: [bidSchema],
  total_amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Pre-save hook to calculate total amount
starlineBidSchema.pre('save', function (next) {
  if (this.isModified('bids')) {
    this.total_amount = this.bids.reduce((sum, bid) => sum + bid.bid_amount, 0);
  }
  next();
});

// Indexes for better query performance
starlineBidSchema.index({ user_id: 1, created_at: -1 });
starlineBidSchema.index({ 'bids.game_id': 1, 'bids.game_type': 1 });

const StarlineBid = mongoose.models.StarlineBid ||
  mongoose.model<IStarlineBidDocument>('StarlineBid', starlineBidSchema);

export default StarlineBid;
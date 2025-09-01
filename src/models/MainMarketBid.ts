import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBid {
  digit?: string;
  panna?: string;
  bid_amount: number;
  game_id: Types.ObjectId;
  game_type: string;
  session?: 'open' | 'close';
}

export interface IMainMarketBid {
  user_id: Types.ObjectId;
  bids: IBid[];
  total_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface IMainMarketBidDocument extends IMainMarketBid, Document {}

const bidSchema = new Schema<IBid>({
  digit: {
    type: String,
    validate: {
      validator: function(this: IBid, v: string) {
        // Digit is required for digit-based games in the appropriate session
        const digitGames = ['single-digit', 'jodi-digit', 'two-digit', 'digit-base-jodi', 'red-bracket'];
        const pannaGames = ['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna'];
        
        if (digitGames.includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '';
        }
        
        if (pannaGames.includes(this.game_type) && this.game_type !== 'choice-panna') {
          return v === undefined || v === null || v === '';
        }
        
        return true;
      },
      message: 'Digit is required for this game type'
    }
  },
  panna: {
    type: String,
    validate: {
      validator: function(this: IBid, v: string) {
        // Panna is required for panna-based games
        const pannaGames = ['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna'];
        
        if (pannaGames.includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '';
        }
        
        const digitGames = ['single-digit', 'jodi-digit', 'two-digit', 'digit-base-jodi', 'red-bracket'];
        if (digitGames.includes(this.game_type)) {
          return v === undefined || v === null || v === '';
        }
        
        return true;
      },
      message: 'Panna is required for this game type'
    }
  },
  bid_amount: {
    type: Number,
    required: true,
  },
  game_id: {
    type: Schema.Types.ObjectId,
    ref: 'MainMarketGame',
    required: true,
  },
  game_type: {
    type: String,
    enum: [
      'single-digit', 'jodi-digit', 'single-panna', 'double-panna', 
      'triple-panna', 'half-sangam', 'full-sangam', 'sp-motor', 
      'dp-motor', 'sp-dp-tp-motor', 'odd-even', 'two-digit', 
      'digit-base-jodi', 'choice-panna', 'red-bracket'
    ],
    required: true
  },
  session: {
    type: String,
    enum: ['open', 'close'],
    validate: {
      validator: function(this: IBid, v: string) {
        // Session is not required for these game types
        if (['full-sangam', 'jodi-digit', 'red-bracket', 'odd-even'].includes(this.game_type)) {
          return v === undefined || v === null || v === '';
        }
        
        // Session is required for other game types
        return v !== undefined && v !== null && v !== '';
      },
      message: 'Session is required for this game type'
    }
  }
});

const mainMarketBidSchema = new Schema<IMainMarketBidDocument>({
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
mainMarketBidSchema.pre('save', function (next) {
  if (this.isModified('bids')) {
    this.total_amount = this.bids.reduce((sum, bid) => sum + bid.bid_amount, 0);
  }
  next();
});

// Indexes for better query performance
mainMarketBidSchema.index({ user_id: 1, created_at: -1 });
mainMarketBidSchema.index({ 'bids.game_id': 1, 'bids.session': 1, 'bids.game_type': 1 });

const MainMarketBid = mongoose.models.MainMarketBid || 
  mongoose.model<IMainMarketBidDocument>('MainMarketBid', mainMarketBidSchema);

export default MainMarketBid;
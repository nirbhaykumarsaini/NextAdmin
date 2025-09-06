import mongoose, { Document, Schema, Types } from 'mongoose';
import '@/models/AppUser'
import '@/models/MainMarketGame'

export interface IBid {
  digit?: string;
  panna?: string;
  bid_amount: number;
  game_id: Types.ObjectId;
  game_type: string;
  session?: 'open' | 'close';
  open_panna?: string; // For full-sangam
  close_panna?: string; // For full-sangam
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
        // Digit validation based on game type
        if (['single-digit', 'odd-even'].includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '' && /^[0-9]$/.test(v);
        }
        
        if (['jodi-digit', 'red-bracket'].includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '' && /^[0-9]{2}$/.test(v);
        }
        
        if (['digit-base-jodi'].includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '' && /^[0-9]{2}$/.test(v);
        }
        
        if (this.game_type === 'half-sangam') {
          if (this.session === 'open') {
            return v !== undefined && v !== null && v !== '' && /^[0-9]$/.test(v);
          } else if (this.session === 'close') {
            return v === undefined || v === null || v === '';
          }
        }
        
        // For other game types, digit should not be present
        return v === undefined || v === null || v === '';
      },
      message: 'Digit is invalid for this game type'
    }
  },
  panna: {
    type: String,
    validate: {
      validator: function(this: IBid, v: string) {
        // Panna validation based on game type
        const pannaGames = ['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna', 'two-digit'];
        
        if (pannaGames.includes(this.game_type)) {
          return v !== undefined && v !== null && v !== '' && /^[0-9]{3}$/.test(v);
        }
        
        if (this.game_type === 'half-sangam') {
          if (this.session === 'close') {
            return v !== undefined && v !== null && v !== '' && /^[0-9]{3}$/.test(v);
          } else if (this.session === 'open') {
            return v === undefined || v === null || v === '';
          }
        }
        
        // For other game types, panna should not be present
        return v === undefined || v === null || v === '';
      },
      message: 'Panna is invalid for this game type'
    }
  },
  open_panna: {
    type: String,
    validate: {
      validator: function(this: IBid, v: string) {
        // Only for full-sangam
        if (this.game_type === 'full-sangam') {
          return v !== undefined && v !== null && v !== '' && /^[0-9]{3}$/.test(v);
        }
        return v === undefined || v === null || v === '';
      },
      message: 'Open panna is required for full-sangam and must be 3 digits'
    }
  },
  close_panna: {
    type: String,
    validate: {
      validator: function(this: IBid, v: string) {
        // Only for full-sangam
        if (this.game_type === 'full-sangam') {
          return v !== undefined && v !== null && v !== '' && /^[0-9]{3}$/.test(v);
        }
        return v === undefined || v === null || v === '';
      },
      message: 'Close panna is required for full-sangam and must be 3 digits'
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
        if (['full-sangam', 'jodi-digit', 'red-bracket'].includes(this.game_type)) {
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
export interface Bid {
  digit?: string;
  panna?: string;
  bid_amount: number;
  game_id?: {
    _id: string;
    game_name: string;
  };
  game_type: string;
  session?: string;
}

export interface BidDocument {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    mobile_number: string;
  };
  bids: Bid[];
  created_at: string | Date;
}

export interface TransformedBid {
  _id: string;
  user_id: string;
  name: string;
  mobile_number: string;
  digit?: string;
  panna?: string;
  bid_amount: number;
  game_id?: string;
  game_name?: string;
  game_type: string;
  session?: string;
  created_at: string | Date;
}

export function transformBids(bids: BidDocument[]): TransformedBid[] {
  return bids.flatMap((doc) =>
    doc.bids.map((bid) => ({
      _id: doc._id.toString(),
      user_id: doc.user_id._id.toString(),
      name: doc.user_id.name,
      mobile_number: doc.user_id.mobile_number,
      digit: bid.digit,
      panna: bid.panna,
      bid_amount: bid.bid_amount,
      game_id: bid.game_id?._id?.toString(),
      game_name: bid.game_id?.game_name,
      game_type: bid.game_type,
      session: bid.session,
      created_at: doc.created_at,
    }))
  );
}
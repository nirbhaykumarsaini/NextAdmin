export function transformBids(bids: any[]) {
  return bids.flatMap((doc) =>
    doc.bids.map((bid: any) => ({
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

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISinglePanna extends Document {
  digit: string;
}

const singlePannaSchema: Schema = new Schema(
  {
    digit: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{3}$/, "Digit must be a three-digit number"]
    }
  }
);

singlePannaSchema.index({ digit: 1 }, { unique: true });

const SinglePanna: Model<ISinglePanna> = mongoose.models.SinglePanna || mongoose.model<ISinglePanna>('SinglePanna', singlePannaSchema);

export default SinglePanna;
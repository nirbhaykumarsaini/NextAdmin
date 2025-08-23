import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITriplePanna extends Document {
  digit: string;
}

const triplePannaSchema: Schema = new Schema(
  {
    digit: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{3}$/, "Digit must be a three-digit number"]
    }
  }
);

triplePannaSchema.index({ digit: 1 }, { unique: true });

const TriplePanna: Model<ITriplePanna> = mongoose.models.TriplePanna || mongoose.model<ITriplePanna>('TriplePanna', triplePannaSchema);

export default TriplePanna;
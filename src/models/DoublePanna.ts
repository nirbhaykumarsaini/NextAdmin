import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDoublePanna extends Document {
  digit: string;
}

const doublePannaSchema: Schema = new Schema(
  {
    digit: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{3}$/, "Digit must be a three-digit number"]
    }
  }
);

doublePannaSchema.index({ digit: 1 }, { unique: true });

const DoublePanna: Model<IDoublePanna> = mongoose.models.DoublePanna || mongoose.model<IDoublePanna>('DoublePanna', doublePannaSchema);

export default DoublePanna;
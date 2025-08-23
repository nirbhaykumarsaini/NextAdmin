import mongoose, { Document, Schema } from 'mongoose';



export interface IStarlineRate extends Document {
  single_digit_point: number;
  single_digit_amount: number;
  single_panna_point: number;
  single_panna_amount: number;
  double_panna_point: number;
  double_panna_amount: number;
  triple_panna_point: number;
  triple_panna_amount: number;
}

const starlineRateSchema = new Schema<IStarlineRate>(
  {
    single_digit_point: {
      type: Number,
      trim: true,
      required: [true, "single_digit_point is required"],
    },
    single_digit_amount: {
      type: Number,
      trim: true,
      required: [true, "single_digit_amount is required"],
    },
    single_panna_point: {
      type: Number,
      trim: true,
      required: [true, "single_panna_point is required"],
    },
     single_panna_amount: {
      type: Number,
      trim: true,
      required: [true, "single_panna_amount is required"],
    },
     double_panna_point: {
      type: Number,
      trim: true,
      required: [true, "double_panna_point is required"],
    },
     double_panna_amount: {
      type: Number,
      trim: true,
      required: [true, "double_panna_amount is required"],
    },
     triple_panna_point: {
      type: Number,
      trim: true,
      required: [true, "triple_panna_point is required"],
    },
     triple_panna_amount: {
      type: Number,
      trim: true,
      required: [true, "triple_panna_amount is required"],
    }
  
  }

);

const StarlineRate = mongoose.models.StarlineRate || mongoose.model<IStarlineRate>('StarlineRate', starlineRateSchema);

export default StarlineRate;
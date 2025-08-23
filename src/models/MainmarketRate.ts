import mongoose, { Document, Schema } from 'mongoose';



export interface IMainMarketRate extends Document {
  single_digit_point: number;
  single_digit_amount: number;
  jodi_digit_point: number;
  jodi_digit_amount: number;
  single_panna_point: number;
  single_panna_amount: number;
  double_panna_point: number;
  double_panna_amount: number;
  triple_panna_point: number;
  triple_panna_amount: number;
  half_sangam_point: number;
  half_sangam_amount: number;
  full_sangam_point: number;
  full_sangam_amount: number;

}



const mainMarketRateSchema = new Schema<IMainMarketRate>(
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
    jodi_digit_point: {
      type: Number,
      trim: true,
      required: [true, "jodi_digit_point is required"],
    },
    jodi_digit_amount: {
      type: Number,
      trim: true,
      required: [true, "jodi_digit_amount is required"],
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
    },
     full_sangam_point: {
      type: Number,
      trim: true,
      required: [true, "full_sangam_point is required"],
    },
     full_sangam_amount: {
      type: Number,
      trim: true,
      required: [true, "full_sangam_amount is required"],
    },
     half_sangam_point: {
      type: Number,
      trim: true,
      required: [true, "half_sangam_point is required"],
    },
     half_sangam_amount: {
      type: Number,
      trim: true,
      required: [true, "half_sangam_amount is required"],
    },
  
  }

);

const MainMarketRate = mongoose.models.MainMarketRate || mongoose.model<IMainMarketRate>('MainMarketRate', mainMarketRateSchema);

export default MainMarketRate;
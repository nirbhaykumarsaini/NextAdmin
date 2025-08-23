import mongoose, { Document, Schema } from 'mongoose';



export interface IGalidisawarRate extends Document {
  left_digit_point: number;
  left_digit_amount: number;
  right_digit_point: number;
  right_digit_amount: number;
  jodi_digit_point: number;
  jodi_digit_amount: number;

}

const galidisawarRateSchema = new Schema<IGalidisawarRate>(
  {
    left_digit_point: {
      type: Number,
      trim: true,
      required: [true, "left_digit_point is required"],
    },
    left_digit_amount: {
      type: Number,
      trim: true,
      required: [true, "left_digit_amount is required"],
    },
    right_digit_point: {
      type: Number,
      trim: true,
      required: [true, "right_digit_point is required"],
    },
     right_digit_amount: {
      type: Number,
      trim: true,
      required: [true, "right_digit_amount is required"],
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
    }
  
  }

);

const GalidisawarRate = mongoose.models.GalidisawarRate || mongoose.model<IGalidisawarRate>('GalidisawarRate', galidisawarRateSchema);

export default GalidisawarRate;
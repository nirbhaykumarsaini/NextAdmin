import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJodiDigit extends Document {
    digit: string;
}

const jodiDigitSchema: Schema = new Schema(
    {
        digit: {
            type: String,
            required: [true, "Digit is required"],
            match: [/^\d{2}$/, "Digit must be a two-digit number"],
            unique: true
        }
    },
   
);

// Create index for better performance
jodiDigitSchema.index({ digit: 1 }, { unique: true });

const JodiDigit: Model<IJodiDigit> = mongoose.models.JodiDigit || mongoose.model<IJodiDigit>('JodiDigit', jodiDigitSchema);

export default JodiDigit;
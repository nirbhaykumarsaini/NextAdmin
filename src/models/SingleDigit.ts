import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISingleDigit extends Document {
    digit: number;
}

const singleDigitSchema: Schema = new Schema({
    digit: {
        type: Number,
        required: true,
        unique: true
    }
});

const SingleDigit: Model<ISingleDigit> = mongoose.models.SingleDigit || mongoose.model<ISingleDigit>('SingleDigit', singleDigitSchema);

export default SingleDigit;
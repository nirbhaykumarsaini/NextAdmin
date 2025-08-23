import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUPI extends Document {
    upi_id: string;
    is_active: boolean;
}

const upiSchema: Schema = new Schema(
    {
        upi_id: {
            type: String,
            required: [true, "upi_id is required"]
        },
        is_active: {
            type: Boolean,
            default: false
        }
    },
);

const UPI: Model<IUPI> = mongoose.models.UPI || mongoose.model<IUPI>('UPI', upiSchema);

export default UPI;
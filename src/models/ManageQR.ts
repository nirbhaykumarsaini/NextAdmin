import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IManageQr extends Document {
    qr_code: string;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const manageQrSchema: Schema = new Schema(
    {
        qr_code: {
            type: String,
            required: [true, "qr_code is required"]
        },
        is_active: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const ManageQR: Model<IManageQr> = mongoose.models.ManageQR || mongoose.model<IManageQr>('ManageQR', manageQrSchema);

export default ManageQR;
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMaintenance extends Document {
    is_active: boolean;
    maintenance_title: string;
    expected_completion_date?: Date;
    expected_completion_time?: string;
    maintenance_message: string;
}

const maintenanceSchema: Schema = new Schema(
    {
        is_active: {
            type: Boolean,
            default: false,
            required: true
        },
        maintenance_title: {
            type: String,
            default: ''
        },
        expected_completion_date: {
            type: Date
        },
        expected_completion_time: {
            type: String
        },
        maintenance_message: {
            type: String,
            default: ''
        }
    },
);

const Maintenance: Model<IMaintenance> = mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);

export default Maintenance;
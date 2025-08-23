import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRole extends Document {
    role_name: string;
    role_description: string;
    permissions: Types.ObjectId[]; // Reference to Permission documents
}

const roleSchema: Schema = new Schema(
    {
        role_name: {
            type: String,
            required: [true, "Role name is required"],
            unique: true,
            trim: true,
            maxlength: [50, "Role name cannot exceed 50 characters"]
        },
        role_description: {
            type: String,
            required: [true, "Role description is required"],
            trim: true,
            maxlength: [200, "Role description cannot exceed 200 characters"]
        },
        permissions: [{
            type: Schema.Types.ObjectId,
            ref: 'Permission',
            required: true
        }]
    },
    { timestamps: true }
);

// Create index for better performance
roleSchema.index({ role_name: 1 }, { unique: true });

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema);

export default Role;
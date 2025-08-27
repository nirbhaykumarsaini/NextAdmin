import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPermission extends Document {
    permission_name: string;
    permission_key: string;
    permission_description: string;
    category:string;
}

const permissionSchema: Schema = new Schema(
    {
        permission_name: {
            type: String,
            required: [true, "Permission name is required"],
            trim: true,
            maxlength: [100, "Permission name cannot exceed 100 characters"]
        },
        permission_key: {
            type: String,
            required: [true, "Permission key is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[a-z_]+$/, "Permission key can only contain lowercase letters and underscores"]
        },
        permission_description: {
            type: String,
            required: [true, "Permission description is required"],
            trim: true,
            maxlength: [500, "Permission description cannot exceed 500 characters"]
        },
        category: {
            type: String,
            required: [true, "Permission category is required"],
            trim: true,
            enum: {
                values: ['Users', 'Content', 'System', 'Financial', 'Analytics'],
                message: 'Category must be one of: Users, Content, System, Financial, Analytics'
            }
        }
    },
    { timestamps: true }
);

// Create index for better performance
permissionSchema.index({ key: 1 }, { unique: true });
permissionSchema.index({ category: 1 });

const Permission: Model<IPermission> = mongoose.models.Permission || mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;
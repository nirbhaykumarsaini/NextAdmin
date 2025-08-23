import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAccountSettings extends Document {
    welcome_bonus: number;
    global_batting: boolean;
    min_deposit: number;
    max_deposit: number;
    min_withdrawal: number;
    max_withdrawal: number;
    min_bid_amount: number;
    max_bid_amount: number;
    withdrawal_period: "morning" | "evening";
    withdrawal_open_time: string;
    withdrawal_close_time: string;
}

const accountSettingsSchema: Schema = new Schema(
    {
        welcome_bonus: {
            type: Number,
            default: 10
        },
        global_batting: {
            type: Boolean,
            default: true
        },
        min_deposit: {
            type: Number,
            default: 0
        },
        max_deposit: {
            type: Number,
            default: 0
        },
        min_withdrawal: {
            type: Number,
            default: 0
        },
        max_withdrawal: {
            type: Number,
            default: 0
        },
        min_bid_amount: {
            type: Number,
            default: 0
        },
        max_bid_amount: {
            type: Number,
            default: 0
        },
        withdrawal_period: {
            type: String,
            enum: ["morning", "evening"],
            default: "morning"
        },
        withdrawal_open_time: {
            type: String,
        },
        withdrawal_close_time: {
            type: String,
        }
    }
);

const AccountSetting: Model<IAccountSettings> = mongoose.models.AccountSetting || mongoose.model<IAccountSettings>('AccountSetting', accountSettingsSchema);

export default AccountSetting;
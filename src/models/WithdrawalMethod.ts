import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";

export interface IWithdrawalMethod {
  user_id: Types.ObjectId;
  withdraw_type: "phonepe" | "googlepay" | "paytmpay" | "bank";
  account_holder_name?: string;
  account_number?: string;
  confirm_account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  branch_name?: string;
  paytm_number?: string;
  phonepe_number?: string;
  googlepay_number?: string;
  created_at?: Date;
  updated_at?: Date;
}

const withdrawalMethodSchema = new Schema<IWithdrawalMethod>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
    },

    withdraw_type: {
      type: String,
      required: true,
      enum: ["phonepe", "googlepay", "paytmpay", "bank"],
    },

    // Bank details
    account_holder_name: {
      type: String,
      trim: true,
    },
    account_number: {
      type: String,
      match: /^[0-9]{9,18}$/, // typical bank account number length
    },
    confirm_account_number: {
      type: String,
      validate: {
        validator: function (this: IWithdrawalMethod, val: string) {
          return val === this.account_number;
        },
        message: "Confirm Account Number must match Account Number",
      },
    },
    ifsc_code: {
      type: String,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/, // IFSC regex
    },
    bank_name: {
      type: String,
      trim: true,
    },
    branch_name: {
      type: String,
      trim: true,
    },

    // UPI / Wallet Numbers
    paytm_number: {
      type: String,
      match: /^[6-9]\d{9}$/, // Indian mobile number
    },
    phonepe_number: {
      type: String,
      match: /^[6-9]\d{9}$/,
    },
    googlepay_number: {
      type: String,
      match: /^[6-9]\d{9}$/,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Custom validation depending on withdraw_type
withdrawalMethodSchema.pre("validate", function (next) {
  if (this.withdraw_type === "bank") {
    if (
      !this.account_holder_name ||
      !this.account_number ||
      !this.confirm_account_number ||
      !this.ifsc_code ||
      !this.bank_name ||
      !this.branch_name
    ) {
      return next(new Error("All bank details are required"));
    }
  }

  if (this.withdraw_type === "paytmpay" && !this.paytm_number) {
    return next(new Error("Paytm Number is required"));
  }

  if (this.withdraw_type === "phonepe" && !this.phonepe_number) {
    return next(new Error("PhonePe Number is required"));
  }

  if (this.withdraw_type === "googlepay" && !this.googlepay_number) {
    return next(new Error("Google Pay Number is required"));
  }

  next();
});

const WithdrawalMethod =
  mongoose.models.WithdrawalMethod ||
  mongoose.model<IWithdrawalMethod>("WithdrawalMethod", withdrawalMethodSchema);

export default WithdrawalMethod;

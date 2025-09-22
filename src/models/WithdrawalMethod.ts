import mongoose, { Schema, Types } from "mongoose";
import "@/models/AppUser";

export interface IWithdrawalMethod {
  user_id: Types.ObjectId;
  withdraw_type: "phonepay" | "googlepay" | "paytmpay" | "bank";
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
      enum: ["phonepay", "googlepay", "paytmpay", "bank"],
    },
    // Bank details
    account_holder_name: String,
    account_number: String,
    confirm_account_number: String,
    ifsc_code: String,
    bank_name: String,
    branch_name: String,
    // UPI / Wallet Numbers
    paytm_number: String,
    phonepe_number: String,
    googlepay_number: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    minimize: true, // This removes empty objects
  }
);

// Pre-save middleware to delete all irrelevant fields based on withdraw_type
withdrawalMethodSchema.pre("save", function (next) {
  const withdrawal = this as any; // Use any to access unset method

  // Define which fields should be kept for each withdraw_type
  const allowedFields: { [key: string]: string[] } = {
    bank: ['account_holder_name', 'account_number', 'ifsc_code', 'bank_name', 'branch_name'],
    paytmpay: ['paytm_number'],
    phonepay: ['phonepe_number'],
    googlepay: ['googlepay_number']
  };

  // Get fields to keep for current withdraw_type
  const fieldsToKeep = allowedFields[this.withdraw_type] || [];
  
  // Add mandatory fields that should always be kept
  fieldsToKeep.push('user_id', 'withdraw_type', 'created_at', 'updated_at');

  // Get all schema paths
  const schemaPaths = Object.keys(this.schema.paths);
  
  // Remove all fields that are not in the allowed list
  schemaPaths.forEach(field => {
    if (!fieldsToKeep.includes(field) && field !== '_id' && field !== '__v') {
      withdrawal[field] = undefined;
      withdrawal.unset(field); // This completely removes the field from the document
    }
  });

  next();
});

// Custom validation depending on withdraw_type
withdrawalMethodSchema.pre("validate", function (next) {
  if (this.withdraw_type === "bank") {
    if (
      !this.account_holder_name ||
      !this.account_number ||
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

  if (this.withdraw_type === "phonepay" && !this.phonepe_number) {
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
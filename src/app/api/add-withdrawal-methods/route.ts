import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import ApiError from "@/lib/errors/APiError"; // Fixed typo: APiError → ApiError
import mongoose from "mongoose";
import WithdrawalMethod from "@/models/WithdrawalMethod";
import AppUser from "@/models/AppUser";

// ✅ POST: Add or Update Withdrawal Method
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { user_id, withdraw_type, ...fields } = body;

    // ✅ Validate user_id
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new ApiError("Invalid user_id");
    }

    if (!["phonepay", "googlepay", "paytmpay", "bank"].includes(withdraw_type)) {
      throw new ApiError("Invalid withdraw type");
    }

    // ✅ Find user
    const user = await AppUser.findById(user_id);
    if (!user) {
      throw new ApiError("User not found");
    }

    // ✅ Validate that required fields are present for the withdraw_type
    validateRequiredFields(withdraw_type, fields);

    // Clean up ALL fields - only keep what's relevant for this withdraw_type
    const cleanedFields = cleanWithdrawalFieldsAggressive(withdraw_type, fields);

    // ✅ Use findOneAndUpdate with upsert for atomic operation
    const withdrawalMethod = await WithdrawalMethod.findOneAndUpdate(
      { user_id, withdraw_type },
      { $set: cleanedFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    const message = withdrawalMethod.$isNew ?
      "Withdrawal method added successfully" :
      "Withdrawal method updated successfully";

    return NextResponse.json({
      status: true,
      message,
      data: withdrawalMethod,
    });
  } catch (error: unknown) {
    console.error("Withdrawal Method POST Error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json({ status: false, message: error.message });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        status: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to process withdrawal method";
    return NextResponse.json({ status: false, message: errorMessage });
  }
}

// Validate that required fields are present for the specific withdraw_type
function validateRequiredFields(withdraw_type: string, fields: any) {
  const requiredFields: { [key: string]: string[] } = {
    bank: ['account_holder_name', 'account_number', 'ifsc_code', 'bank_name', 'branch_name'],
    paytmpay: ['paytm_number'],
    phonepay: ['phonepe_number'],
    googlepay: ['googlepay_number']
  };

  const required = requiredFields[withdraw_type] || [];
  const missingFields: string[] = [];

  required.forEach(field => {
    if (!fields[field] || fields[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new ApiError(`${missingFields.join(', ')} are required for ${withdraw_type}`);
  }
}

// Aggressive field cleaning - only keeps fields relevant to the withdraw_type
function cleanWithdrawalFieldsAggressive(withdraw_type: string, fields: any) {
  const fieldMap: { [key: string]: string[] } = {
    bank: ['account_holder_name', 'account_number', 'ifsc_code', 'bank_name', 'branch_name'],
    paytmpay: ['paytm_number'],
    phonepay: ['phonepe_number'],
    googlepay: ['googlepay_number']
  };

  const allowedFields = fieldMap[withdraw_type] || [];
  const cleanedFields: any = {};

  // Only copy allowed fields
  allowedFields.forEach(field => {
    if (fields[field] !== undefined && fields[field] !== null && fields[field] !== '') {
      cleanedFields[field] = fields[field];
    }
  });

  return cleanedFields;
}
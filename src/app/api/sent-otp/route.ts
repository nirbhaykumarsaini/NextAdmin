import ApiError from "@/lib/errors/APiError";
import { NextResponse } from "next/server";
import {sendOtp, verifyOtp} from '@/services/otpService'

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const otpResponse = await sendOtp(body.mobile,'')

    return NextResponse.json({
      status: true,
      message: 'User registered successfully. Please verify OTP.',
      otpResponse
    });

  } catch (error: unknown) {

    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message }
      );
    }    

    return NextResponse.json(
      { status: false, message: 'Internal server error' }
    );
  }
}
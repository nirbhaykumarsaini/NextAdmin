// utils/otp.ts
import twilio from "twilio";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";


const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Generate random 6-digit otp
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP SMS
export async function sendOtp(mobile: string, otp: string): Promise<{
  success: boolean;
  data?: MessageInstance;
  error?: string;
}> {
  try {
    const res = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE!,
      to: mobile.startsWith("+") ? mobile : `+91${mobile}`,
    });

    return { success: true, data: res };
  } catch (err: unknown) {
    // Handle ALL error type
    const errorMessage =
      err instanceof Error ? err.message : "Unknown Twilio SMS error";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Verify OTP
export function verifyOtp(savedOtp: string, userOtp: string) {
  return savedOtp === userOtp;
}

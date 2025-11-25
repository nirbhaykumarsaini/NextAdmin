// utils/otp.ts
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Generate random 6-digit otp
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP SMS
export async function sendOtp(mobile: string, otp: string) {
  try {
    const response = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE!,
      to: mobile.startsWith("+") ? mobile : `+91${mobile}`
    });

    return {
      success: true,
      twilioResponse: response
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error?.message || "Failed to send SMS"
      };
    }
  }
}

// Verify OTP
export function verifyOtp(savedOtp: string, userOtp: string) {
  return savedOtp === userOtp;
}

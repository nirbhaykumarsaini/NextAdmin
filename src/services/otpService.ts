// src/services/otpService.ts
import axios from "axios";


export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(mobile: string, otp:string) {
  try {

    const url = `https://connect.muzztech.com/api/sms/send?api_key=${process.env.MUZZTECH_API_KEY}&phone_number=${mobile}&sender_name=TBHVNI&message=Dear user, your One Time Password OTP is ${otp} for Bhavani Traders. Please do not share this one time password with anyone else. Thanks, BHAVANI&template_id=1707169753105947862`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "success") {
      return { success: false, error: data.message };
    }

    // Save OTP in DB or cache for verification
    return {
      success: true,
      otp: otp
    };

  } catch (err: unknown) {
    if(err instanceof Error){
      return { success: false, error: err.message };
    }
  }
}

export async function verifyOtp(savedOtp: string, userOtp: string) {

  if (savedOtp !== userOtp) {
    return { success: false, error: "Invalid OTP" };
  }

  return { success: true };
}

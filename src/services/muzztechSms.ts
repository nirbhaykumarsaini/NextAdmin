// src/services/muzztechOtp.ts

export async function sendMuzztechOtp(mobile: string) {
  try {
    const res = await fetch("https://connect.muzztech.com/api/V1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.MUZZTECH_API_KEY,
        phone_number: mobile,
        otp_template_name: "login_otp" // your template name
      })
    });

    const data = await res.json();

    if (data.Status !== "Success") {
      return { success: false, error: data.Details || "Failed to send OTP" };
    }

    return {
      success: true,
      otp_session: data.Details, // save this in DB
      otp: data.OTP // OPTIONAL (only for debugging)
    };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


// VERIFY OTP
export async function verifyMuzztechOtp(otp_session: string, otp: string) {
  try {
    const res = await fetch("https://connect.muzztech.com/api/V1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.MUZZTECH_API_KEY,
        otp_session: otp_session,
        otp_entered_by_user: otp
      })
    });

    const data = await res.json();

    if (data.Status !== "Success") {
      return { success: false, error: data.Details };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

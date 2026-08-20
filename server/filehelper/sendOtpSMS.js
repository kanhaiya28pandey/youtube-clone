import twilioClient from "./twilio.js";

export const sendOtpSMS = async (phone, otp) => {
  try {
    let formattedPhone = phone.trim();

    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
    }

    if (!/^\+91\d{10}$/.test(formattedPhone)) {
      throw new Error(
        "Invalid mobile number. Please enter a valid 10-digit Indian mobile number.",
      );
    }

    console.log("Sending OTP to:", formattedPhone);
    console.log("From:", process.env.TWILIO_PHONE_NUMBER);

    const message = await twilioClient.messages.create({
      body: `Your YourTube verification OTP is ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log("Twilio SMS sent successfully:", message.sid);

    return message;
  } catch (error) {
    console.error("Twilio SMS error:", error);

    console.error("Twilio error code:", error.code);
    console.error("Twilio error message:", error.message);
    console.error("Twilio more info:", error.moreInfo);

    throw error;
  }
};

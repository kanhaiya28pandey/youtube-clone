import users from "../Models/Auth.js";
import otpGenerator from "otp-generator";
import transporter from "../filehelper/emailOTP.js";
import twilioClient from "../filehelper/twilio.js";

const SOUTH_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
];

// ---------------- SEND OTP ----------------

export const sendOTP = async (req, res) => {
  try {
    const {
      email,
      phone,
      state,
      name
    } = req.body;

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = await users.findOne({ email });

    if (!user) {
      user = await users.create({
        email,
        phone,
        state,
        name,
      });
    }

    user.phone = phone;
    user.state = state;
    user.otp = otp;
    user.otpExpires = expiry;

    await user.save();

    // SOUTH INDIA

    if (SOUTH_STATES.includes(state)) {

      await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "YourTube OTP Verification",

        html: `
        <h2>YourTube Verification</h2>

        <p>Your OTP is</p>

        <h1>${otp}</h1>

        <p>Valid for 5 minutes.</p>
        `
      });

      return res.json({

        success: true,

        method: "email",

        message: "OTP sent to Email"

      });

    }

    // OTHER STATES

    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({

        to: phone,

        channel: "sms",

      });

    return res.json({

      success: true,

      method: "sms",

      message: "OTP sent to Mobile"

    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({

      success: false,

      message: err.message,

    });

  }
};

// ---------------- VERIFY OTP ----------------

export const verifyOTP = async (req, res) => {

  try {

    const {
      email,
      phone,
      state,
      otp
    } = req.body;

    // SOUTH INDIA

    if (SOUTH_STATES.includes(state)) {

      const user = await users.findOne({

        email

      });

      if (!user)

        return res.status(404).json({

          success: false,

          message: "User not found"

        });

      if (user.otpExpires < new Date())

        return res.status(400).json({

          success: false,

          message: "OTP Expired"

        });

      if (user.otp !== otp)

        return res.status(400).json({

          success: false,

          message: "Invalid OTP"

        });

      user.otp = "";

      await user.save();

      return res.json({

        success: true

      });

    }

    // OTHER STATES

    const verify = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({

        to: phone,

        code: otp,

      });

    if (verify.status === "approved") {

      return res.json({

        success: true

      });

    }

    return res.status(400).json({

      success: false,

      message: "Invalid OTP"

    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};
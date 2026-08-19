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
    const { email, phone, state, name } = req.body;

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
        from: `"YourTube" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your YourTube verification code",
        html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f4f4f5;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding:40px 20px;"
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width:520px;
                  background:#ffffff;
                  border-radius:16px;
                  overflow:hidden;
                  box-shadow:0 4px 20px rgba(0,0,0,0.08);
                "
              >

                <!-- Header -->
                <tr>
                  <td style="
                    background:#111111;
                    padding:24px;
                    text-align:center;
                  ">

                    <div style="
                      display:inline-block;
                      background:#ff0000;
                      color:#ffffff;
                      font-size:24px;
                      font-weight:bold;
                      padding:8px 12px;
                      border-radius:8px;
                    ">
                      ▶
                    </div>

                    <div style="
                      margin-top:10px;
                      color:#ffffff;
                      font-size:22px;
                      font-weight:bold;
                    ">
                      YourTube
                    </div>

                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:36px 32px;">

                    <h1 style="
                      margin:0 0 12px;
                      color:#18181b;
                      font-size:24px;
                    ">
                      Verify your login
                    </h1>

                    <p style="
                      margin:0 0 24px;
                      color:#52525b;
                      font-size:15px;
                      line-height:1.6;
                    ">
                      Hi ${name || "there"},
                    </p>

                    <p style="
                      margin:0 0 24px;
                      color:#52525b;
                      font-size:15px;
                      line-height:1.6;
                    ">
                      We received a login request for your YourTube
                      account. Use the verification code below to
                      continue.
                    </p>

                    <!-- OTP -->
                    <div style="
                      background:#f4f4f5;
                      border:1px solid #e4e4e7;
                      border-radius:12px;
                      padding:22px;
                      text-align:center;
                      margin:25px 0;
                    ">

                      <div style="
                        color:#71717a;
                        font-size:12px;
                        text-transform:uppercase;
                        letter-spacing:1px;
                        margin-bottom:10px;
                      ">
                        Verification Code
                      </div>

                      <div style="
                        color:#111111;
                        font-size:34px;
                        font-weight:bold;
                        letter-spacing:8px;
                      ">
                        ${otp}
                      </div>

                    </div>

                    <p style="
                      margin:0;
                      color:#71717a;
                      font-size:13px;
                      line-height:1.6;
                    ">
                      This code will expire in
                      <strong>5 minutes</strong>.
                    </p>

                    <p style="
                      margin-top:20px;
                      color:#71717a;
                      font-size:13px;
                      line-height:1.6;
                    ">
                      If you did not attempt to log in to YourTube,
                      you can safely ignore this email.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="
                    background:#fafafa;
                    border-top:1px solid #e4e4e7;
                    padding:20px 32px;
                    text-align:center;
                  ">

                    <p style="
                      margin:0;
                      color:#71717a;
                      font-size:12px;
                    ">
                      © ${new Date().getFullYear()} YourTube
                    </p>

                    <p style="
                      margin:6px 0 0;
                      color:#a1a1aa;
                      font-size:11px;
                    ">
                      This is an automated security email.
                      Please do not reply.
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `,
      });

      return res.json({
        success: true,

        method: "email",

        message: "OTP sent to Email",
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

      message: "OTP sent to Mobile",
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
    const { email, phone, state, otp } = req.body;

    // SOUTH INDIA

    if (SOUTH_STATES.includes(state)) {
      const user = await users.findOne({
        email,
      });

      if (!user)
        return res.status(404).json({
          success: false,

          message: "User not found",
        });

      if (user.otpExpires < new Date())
        return res.status(400).json({
          success: false,

          message: "OTP Expired",
        });

      if (user.otp !== otp)
        return res.status(400).json({
          success: false,

          message: "Invalid OTP",
        });

      user.otp = "";

      await user.save();

      return res.json({
        success: true,
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
        success: true,
      });
    }

    return res.status(400).json({
      success: false,

      message: "Invalid OTP",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

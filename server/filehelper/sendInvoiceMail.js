import nodemailer from "nodemailer";
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

export const sendInvoiceMail = async (
  email,
  name,
  plan,
  amount,
  paymentId
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,

    subject: "YourTube Subscription Invoice",

    html: `
<div style="
  max-width:650px;
  margin:auto;
  font-family:Arial,sans-serif;
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:16px;
  overflow:hidden;
">

  <!-- Header -->
  <div style="
    background:linear-gradient(135deg,#2563eb,#1d4ed8);
    color:white;
    padding:30px;
    text-align:center;
  ">
    <h1 style="margin:0;font-size:28px;">
      👑 YourTube Premium
    </h1>

    <p style="
      margin-top:10px;
      font-size:16px;
      opacity:0.9;
    ">
      Payment Successful
    </p>
  </div>

  <!-- Body -->
  <div style="padding:30px;">

    <h2 style="margin-top:0;">
      Hello ${name},
    </h2>

    <p style="
      color:#4b5563;
      line-height:1.7;
    ">
      Thank you for upgrading your
      <strong>YourTube</strong> account.
      Your subscription has been activated
      successfully.
    </p>

    <!-- Invoice Card -->
    <div style="
      background:#f8fafc;
      border:1px solid #e5e7eb;
      border-radius:12px;
      padding:20px;
      margin:25px 0;
    ">

      <h3 style="
        margin-top:0;
        color:#111827;
      ">
        Invoice Details
      </h3>

      <table style="
        width:100%;
        border-collapse:collapse;
      ">

        <tr>
          <td style="padding:10px 0;color:#6b7280;">
            Plan
          </td>

          <td style="
            text-align:right;
            font-weight:bold;
          ">
            ${plan.toUpperCase()}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#6b7280;">
            Amount Paid
          </td>

          <td style="
            text-align:right;
            font-weight:bold;
            color:#16a34a;
          ">
            ₹${amount}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#6b7280;">
            Transaction ID
          </td>

          <td style="
            text-align:right;
            font-size:13px;
          ">
            ${paymentId}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#6b7280;">
            Date
          </td>

          <td style="text-align:right;">
            ${new Date().toLocaleString()}
          </td>
        </tr>

      </table>

    </div>

    <!-- Benefits -->
    <div style="
      background:#ecfdf5;
      border:1px solid #bbf7d0;
      padding:18px;
      border-radius:12px;
    ">
      <h3 style="
        margin-top:0;
        color:#15803d;
      ">
        Your Benefits
      </h3>

      <ul style="
        padding-left:20px;
        color:#166534;
      ">
        <li>Unlimited Downloads</li>
        <li>Watch Time According To Plan</li>
        <li>Priority Premium Features</li>
      </ul>
    </div>

    <p style="
      margin-top:30px;
      color:#6b7280;
      line-height:1.7;
    ">
      Thank you for choosing
      <strong>YourTube Premium</strong>.
      We hope you enjoy the experience.
    </p>

  </div>

  <!-- Footer -->
  <div style="
    background:#f9fafb;
    padding:20px;
    text-align:center;
    color:#6b7280;
    font-size:13px;
  ">
    © 2026 YourTube. All rights reserved.
  </div>

</div>
`,
  });
};
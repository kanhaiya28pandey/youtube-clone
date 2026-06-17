import { sendInvoiceMail }
  from "../filehelper/sendInvoiceMail.js";
import Razorpay from "razorpay";
import Auth from "../Models/Auth.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      paymentId,
      orderId,
      signature,
      plan,
    } = req.body;

    let amount = 0;

    switch (plan) {
      case "bronze":
        amount = 1000; // ₹10
        break;

      case "silver":
        amount = 5000; // ₹50
        break;

      case "gold":
        amount = 10000; // ₹100
        break;

      default:
        return res.status(400).json({
          message: "Invalid plan",
        });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

export const upgradePremium = async (req, res) => {
  try {
    const {
      userId,
      paymentId,
      orderId,
      signature,
      plan,
    } = req.body;

    console.log("BODY:", req.body);

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(orderId + "|" + paymentId)
      .digest("hex");

    console.log(
      "Generated:",
      generatedSignature
    );
    console.log(
      "Received :",
      signature
    );

    if (generatedSignature !== signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    console.log("Signature verified");

    // let watchTimeLimit = 5;
    const updatedUser =
      await Auth.findByIdAndUpdate(
        userId,
        {
          isPremium: plan !== "free",
          plan,

          watchTimeLimit:
            plan === "bronze"
              ? 7
              : plan === "silver"
                ? 10
                : plan === "gold"
                  ? 999999
                  : 5,

          watchTimeUsed: 0,
        },
        { new: true }
      );
    let amount = 0;

    switch (plan) {
      case "bronze":
        amount = 10;
        break;

      case "silver":
        amount = 50;
        break;

      case "gold":
        amount = 100;
        break;
    }

    await sendInvoiceMail(
      updatedUser.email,
      updatedUser.name,
      plan.toUpperCase(),
      amount,
      paymentId
    );

    console.log(
      "Updated User:",
      updatedUser
    );

    return res.status(200).json({
      success: true,
      message: "Plan upgraded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("UPGRADE ERROR:");
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
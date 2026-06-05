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
    const options = {
      amount: 9900,
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
    const { userId, paymentId, orderId, signature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    await Auth.findByIdAndUpdate(userId, {
      isPremium: true,
    });

    res.status(200).json({
      message: "Premium activated",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to upgrade",
    });
  }
};
import express from "express";

import {
  createOrder,
  upgradePremium,
} from "../controllers/payment.js";

const router = express.Router();

router.post("/create-order", createOrder);

router.post("/upgrade", upgradePremium);

export default router;
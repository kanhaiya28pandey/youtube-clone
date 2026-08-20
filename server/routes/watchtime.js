import express from "express";

import {
  updateWatchTime,
  getWatchTime,
} from "../controllers/watchtime.js";

const router = express.Router();

router.post("/update", updateWatchTime);

router.get("/status/:userId", getWatchTime);

export default router;
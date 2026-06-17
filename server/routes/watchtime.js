import express from "express";
import { updateWatchTime } from "../controllers/watchtime.js";

const router = express.Router();

router.post("/update", updateWatchTime);

export default router;
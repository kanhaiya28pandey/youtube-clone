import express from "express";
import { downloadVideo, getDownloads, } from "../controllers/download.js";

const router = express.Router();

router.post("/", downloadVideo);
router.get("/:userid", getDownloads);

export default router;
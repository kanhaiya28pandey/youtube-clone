import express from "express";
import { downloadVideo, getDownloads, checkDownload, removeDownload, streamVideoFile, watchVideoFile } from "../controllers/download.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, downloadVideo);
router.get("/", auth, getDownloads);
router.get("/check/:videoid", auth, checkDownload);
router.delete("/:videoid", auth, removeDownload);
router.get("/file/:videoid", auth, streamVideoFile);
router.get("/watch/:videoid", watchVideoFile);

export default router;
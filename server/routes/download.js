import express from "express";
import { downloadVideo, getDownloads, checkDownload, removeDownload,} from "../controllers/download.js";

const router = express.Router();
router.get(
  "/check/:userid/:videoid",
  checkDownload
);
router.delete(
  "/:userid/:videoid",
  removeDownload
);
router.post("/", downloadVideo);
router.get("/:userid", getDownloads);

export default router;
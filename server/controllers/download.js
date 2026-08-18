import download from "../Models/download.js";
import fs from "fs";
import path from "path";
import video from "../Models/video.js";

export const downloadVideo = async (req, res) => {
  const { videoid } = req.body;
  const userid = req.userId;

  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Check if free user exceeded daily limit
    if (!user.isPremium) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const downloadsToday = await download.countDocuments({
        userid,
        downloadedAt: {
          $gte: startOfDay,
        },
      });

      if (downloadsToday >= 1) {
        return res.status(403).json({
          message: "Daily download limit reached. Upgrade to Premium.",
          limitReached: true,
        });
      }
    }

    const existingDownload = await download.findOne({
      userid,
      videoid,
    });

    if (existingDownload) {
      return res.status(200).json({
        success: true,
        message: "Video already downloaded",
      });
    }

    const newDownload = new download({
      userid,
      videoid,
    });

    await newDownload.save();

    return res.status(200).json({
      success: true,
      message: "Download allowed",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const streamVideoFile = async (req, res) => {
  const { videoid } = req.params;
  const userid = req.userId;

  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: Missing credentials",
      });
    }

    const downloadRecord = await download.findOne({
      userid,
      videoid,
    });

    if (!downloadRecord) {
      return res.status(403).json({
        message: "You haven't downloaded this video",
      });
    }

    const videoDoc = await video.findById(videoid);

    if (!videoDoc) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    const filePath = path.join(videoDoc.filepath);
    const fullPath = path.resolve(filePath);

    const uploadsDir = path.resolve("uploads");
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        message: "File not found on server",
      });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${videoDoc.filename}"`,
      });

      fs.createReadStream(fullPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${videoDoc.filename}"`,
      });

      fs.createReadStream(fullPath).pipe(res);
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const getDownloads = async (req, res) => {
  const userid = req.userId;

  try {
    const downloads = await download
      .find({ userid })
      .populate("videoid")
      .sort({ downloadedAt: -1 });

    return res.status(200).json(downloads);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const checkDownload = async (req, res) => {
  try {
    const { videoid } = req.params;
    const userid = req.userId;

    const existingDownload = await download.findOne({
      userid,
      videoid,
    });

    return res.status(200).json({
      downloaded: !!existingDownload,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const removeDownload = async (req, res) => {
  try {
    const { videoid } = req.params;
    const userid = req.userId;

    await download.findOneAndDelete({
      userid,
      videoid,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const watchVideoFile = async (req, res) => {
  const { videoid } = req.params;

  try {
    const videoDoc = await video.findById(videoid);

    if (!videoDoc) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    const fullPath = path.resolve(videoDoc.filepath);
    const uploadsDir = path.resolve("uploads");

    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        message: "File not found on server",
      });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader("Content-Type", videoDoc.filetype || "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Disposition", "inline");

    if (!range) {
      res.setHeader("Content-Length", fileSize);

      fs.createReadStream(fullPath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);

    if (isNaN(start) || start >= fileSize) {
      return res.status(416).set({
        "Content-Range": `bytes */${fileSize}`,
      }).end();
    }

    let end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    if (isNaN(end) || end >= fileSize) {
      end = fileSize - 1;
    }

    if (start > end) {
      return res.status(416).set({
        "Content-Range": `bytes */${fileSize}`,
      }).end();
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": videoDoc.filetype || "video/mp4",
      "Content-Disposition": "inline",
    });

    fs.createReadStream(fullPath, {
      start,
      end,
    }).pipe(res);
  } catch (error) {
    console.log("Video streaming error:", error);

    return res.status(500).json({
      message: "Error streaming video",
    });
  }
};
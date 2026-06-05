import download from "../Models/download.js";
import users from "../Models/Auth.js";

export const downloadVideo = async (req, res) => {
  const { userid, videoid } = req.body;

  try {
    const user = await users.findById(userid);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Premium users can download unlimited
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
          message:
            "Daily download limit reached. Upgrade to Premium.",
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
export const getDownloads = async (req, res) => {
  const { userid } = req.params;

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
    const { userid, videoid } = req.params;

    const existingDownload =
      await download.findOne({
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
export const removeDownload = async (
  req,
  res
) => {
  try {
    const { userid, videoid } =
      req.params;

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
      message:
        "Something went wrong",
    });
  }
};
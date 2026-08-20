import Auth from "../Models/Auth.js";

const PLAN_LIMITS = {
  free: 5,
  bronze: 7,
  silver: 10,
};

export const updateWatchTime = async (req, res) => {
  try {
    const { userId, seconds } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const watchSeconds = Number(seconds);

    if (!watchSeconds || watchSeconds <= 0) {
      return res.status(400).json({
        message: "Invalid watch time",
      });
    }

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

     if (user.plan === "gold") {
      user.watchTimeLimit = null;

      await user.save();

      return res.status(200).json({
        unlimited: true,
        remaining: "unlimited",
        used: 0,
      });
    }

    const planLimit = PLAN_LIMITS[user.plan] || 5;

    user.watchTimeLimit = planLimit;

    const currentUsed = Number(user.watchTimeUsed) || 0;

    const addedMinutes = watchSeconds / 60;

    const planLimits = {
      free: 5,
      bronze: 7,
      silver: 10,
    };

    const limit = planLimits[user.plan] || 5;

    const newUsed = Math.min(limit, user.watchTimeUsed + seconds / 60);

    user.watchTimeUsed = newUsed;

    await user.save();

    const remaining = Math.max(0, planLimit - newUsed);

    if (remaining <= 0) {
      return res.status(200).json({
        limitReached: true,
        remaining: 0,
        used: newUsed,
      });
    }

    return res.status(200).json({
      limitReached: false,
      remaining,
      used: newUsed,
    });
  } catch (error) {
    console.log("WATCHTIME ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getWatchTime = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.plan === "gold") {
      return res.status(200).json({
        unlimited: true,
        remaining: null,
        used: user.watchTimeUsed || 0,
        plan: user.plan,
      });
    }

    const planLimit = PLAN_LIMITS[user.plan] || 5;
    const used = Number(user.watchTimeUsed) || 0;

    const remaining = Math.max(0, planLimit - used);

    return res.status(200).json({
      unlimited: false,
      remaining,
      used,
      plan: user.plan,
      limitReached: remaining <= 0,
    });
  } catch (error) {
    console.log("GET WATCHTIME ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

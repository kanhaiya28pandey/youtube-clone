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

    /*
     * GOLD = UNLIMITED
     */

    if (user.plan === "gold") {
      user.watchTimeLimit = null;

      await user.save();

      return res.status(200).json({
        unlimited: true,
        remaining: "unlimited",
        used: 0,
      });
    }

    /*
     * Get correct limit from the user's plan.
     */

    const planLimit = PLAN_LIMITS[user.plan] || 5;

    /*
     * Keep database limit synchronized
     * with the actual plan.
     */

    user.watchTimeLimit = planLimit;

    const currentUsed = Number(user.watchTimeUsed) || 0;

    /*
     * Convert seconds into minutes.
     */

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

    /*
     * User has reached the limit.
     */

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

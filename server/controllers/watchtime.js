import Auth from "../Models/Auth.js";

export const updateWatchTime = async (
    req,
    res
) => {
    try {
        console.log("HEADERS:", req.headers);
        console.log("METHOD:", req.method);
        console.log("BODY:", req.body);
        const { userId, seconds } = req.body;

        const user = await Auth.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.plan === "gold") {
            return res.status(200).json({
                remaining: "unlimited",
            });
        }

        const newUsed =
            Math.min(
                user.watchTimeLimit,
                user.watchTimeUsed + seconds / 60
            );

        user.watchTimeUsed = newUsed;

        await user.save();

        const remaining =
            user.watchTimeLimit - newUsed;

        if (remaining <= 0) {
            return res.status(200).json({
                limitReached: true,
                remaining: 0,
                used: newUsed,
            });
        }

        return res.status(200).json({
            remaining,
            used: newUsed,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};
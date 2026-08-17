import users from "../Models/Auth.js";

export default async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers["x-user-id"];
    let userId = null;

    if (authHeader && typeof authHeader === "string") {
      if (authHeader.startsWith("Bearer ")) {
        userId = authHeader.split(" ")[1];
      } else {
        userId = authHeader; // allow raw id in x-user-id
      }
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing credentials" });
    }

    const user = await users.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid user" });
    }

    req.userId = user._id.toString();
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Auth middleware failed" });
  }
}

import comment from "../Models/comment.js";
import mongoose from "mongoose";

// --------------------------------------------------
// SPECIAL CHARACTER VALIDATION
// --------------------------------------------------

const validateCommentText = (text) => {
  const trimmedText = text?.trim() || "";

  if (!trimmedText) {
    return {
      valid: false,
      message: "Comment cannot be empty",
    };
  }

  const specialChars =
    trimmedText.match(/[^\p{L}\p{N}\s]/gu) || [];

  const specialCharPercentage =
    specialChars.length / trimmedText.length;

  if (specialCharPercentage > 0.4) {
    return {
      valid: false,
      message: "Too many special characters are not allowed",
    };
  }

  return {
    valid: true,
  };
};

// --------------------------------------------------
// POST COMMENT
// --------------------------------------------------

export const postcomment = async (req, res) => {
  try {
    const commentdata = req.body;

    const validation = validateCommentText(
      commentdata.commentbody
    );

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const postcomment = new comment({
      ...commentdata,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    });

    await postcomment.save();

    return res.status(200).json({
      comment: true,
    });
  } catch (error) {
    console.error("Comment error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// GET ALL COMMENTS
// --------------------------------------------------

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;

  try {
    const commentvideo = await comment.find({
      videoid: videoid,
    });

    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("Error loading comments:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// DELETE COMMENT
// --------------------------------------------------

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    await comment.findByIdAndDelete(_id);

    return res.status(200).json({
      comment: true,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// EDIT COMMENT
// --------------------------------------------------

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  // Validate edited comment too
  const validation = validateCommentText(commentbody);

  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  try {
    const updatecomment =
      await comment.findByIdAndUpdate(
        _id,
        {
          $set: {
            commentbody: commentbody.trim(),
          },
        },
        {
          new: true,
        }
      );

    if (!updatecomment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    return res.status(200).json(updatecomment);
  } catch (error) {
    console.error("Error editing comment:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// LIKE / DISLIKE COMMENT
// --------------------------------------------------

export const handleCommentReaction = async (req, res) => {
  const { id } = req.params;
  const { type, userid } = req.body;

  // ------------------------------------------------
  // VALIDATION
  // ------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid comment ID",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(401).json({
      message: "Valid user ID is required",
    });
  }

  if (type !== "like" && type !== "dislike") {
    return res.status(400).json({
      message: "Invalid reaction type",
    });
  }

  try {
    const existingComment = await comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const userId = new mongoose.Types.ObjectId(userid);

    // ------------------------------------------------
    // MAKE SURE ARRAYS EXIST
    // This also handles older comments created before
    // likedBy/dislikedBy were added.
    // ------------------------------------------------

    if (!existingComment.likedBy) {
      existingComment.likedBy = [];
    }

    if (!existingComment.dislikedBy) {
      existingComment.dislikedBy = [];
    }

    const hasLiked = existingComment.likedBy.some(
      (id) => id.toString() === userid
    );

    const hasDisliked = existingComment.dislikedBy.some(
      (id) => id.toString() === userid
    );

    // ------------------------------------------------
    // LIKE
    // ------------------------------------------------

    if (type === "like") {
      // Already liked → remove like
      if (hasLiked) {
        existingComment.likedBy =
          existingComment.likedBy.filter(
            (id) => id.toString() !== userid
          );

        existingComment.likes =
          existingComment.likedBy.length;
      } else {
        // If previously disliked, remove dislike first
        if (hasDisliked) {
          existingComment.dislikedBy =
            existingComment.dislikedBy.filter(
              (id) => id.toString() !== userid
            );
        }

        // Add like
        existingComment.likedBy.push(userId);

        existingComment.likes =
          existingComment.likedBy.length;

        existingComment.dislikes =
          existingComment.dislikedBy.length;
      }
    }

    // ------------------------------------------------
    // DISLIKE
    // ------------------------------------------------

    if (type === "dislike") {
      // Comment owner cannot contribute to the
      // 2-dislike automatic deletion.
      if (
        existingComment.userid.toString() === userid
      ) {
        return res.status(403).json({
          message:
            "You cannot dislike your own comment",
        });
      }

      // Already disliked → remove dislike
      if (hasDisliked) {
        existingComment.dislikedBy =
          existingComment.dislikedBy.filter(
            (id) => id.toString() !== userid
          );

        existingComment.dislikes =
          existingComment.dislikedBy.length;
      } else {
        // If previously liked, remove like first
        if (hasLiked) {
          existingComment.likedBy =
            existingComment.likedBy.filter(
              (id) => id.toString() !== userid
            );
        }

        // Add unique dislike
        existingComment.dislikedBy.push(userId);

        existingComment.dislikes =
          existingComment.dislikedBy.length;

        existingComment.likes =
          existingComment.likedBy.length;
      }

      // ------------------------------------------------
      // AUTO DELETE AFTER 2 UNIQUE DISLIKES
      // ------------------------------------------------

      if (existingComment.dislikedBy.length >= 2) {
        await comment.findByIdAndDelete(id);

        return res.status(200).json({
          deleted: true,
          message:
            "Comment removed after receiving 2 dislikes",
        });
      }
    }

    // ------------------------------------------------
    // SAVE
    // ------------------------------------------------

    await existingComment.save();

    return res.status(200).json(existingComment);
  } catch (error) {
    console.error(
      "Comment reaction error:",
      error
    );

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
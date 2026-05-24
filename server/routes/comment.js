import express from "express";
import {
  deletecomment,
  getallcomment,
  postcomment,
  editcomment,
  handleCommentReaction,
} from "../controllers/comment.js";

const routes = express.Router();
routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
routes.patch("/reaction/:id", handleCommentReaction);
export default routes;

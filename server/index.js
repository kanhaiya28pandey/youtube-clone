import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import otpRoutes from "./routes/otp.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadRoutes from "./routes/download.js";
import paymentRoutes from "./routes/payment.js";
import watchtimeRoutes from "./routes/watchtime.js";
import fs from "fs";
// require("dotenv").config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
import path from "path";

const __dirname = path.resolve();
// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
// File serving is protected and handled by the download controller's streaming endpoint
// (Removed public static mounting for /uploads to enforce permission checks)
// app.use("/uploads", express.static(path.join("uploads")));
app.use("/uploads", express.static(uploadsDir));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/otp", otpRoutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);

app.use("/payment", paymentRoutes);
app.use("/watchtime", watchtimeRoutes);

const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;
app.use("/download", downloadRoutes);
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    console.log(`${socket.id} joined room ${roomId}`);

    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("leave-room", (roomId) => {
    socket.to(roomId).emit("user-left", socket.id);
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
  socket.on("toggle-microphone", ({ roomId, muted }) => {
    socket.to(roomId).emit("toggle-microphone", {
      muted,
    });
  });

  socket.on("toggle-camera", ({ roomId, cameraOff }) => {
    socket.to(roomId).emit("toggle-camera", {
      cameraOff,
    });
  });
});
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Error:", error);
  });

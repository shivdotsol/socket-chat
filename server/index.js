import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import jwt from "jsonwebtoken";
dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
const server = http.createServer(app);
const io = new Server(server);

const onlineUsers = new Map();

// socket middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("unauthorized"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  const user = await User.findById(socket.userId);
  if (!user) return socket.disconnect();

  onlineUsers.set(socket.userId, socket.id);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  console.log("Socket connected:", socket.id, "User:", socket.userId);

  socket.on("joinRoom", async (roomId) => {
    const room = await Room.findById(roomId);
    if (!room) return;
    socket.join(roomId);

    const messages = await Message.find({ room: roomId }).sort({
      createdAt: 1,
    });
    socket.emit("previousMessages", messages);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, text }) => {
    if (!text) return;

    const message = await Message.create({
      room: roomId,
      sender: socket.userId,
      senderName: user.name,
      text,
    });

    io.to(roomId).emit("receiveMessage", message);
  });

  socket.on("typing", ({ roomId, isTyping }) => {
    socket
      .to(roomId)
      .emit("typing", { userId: socket.userId, name: user.name, isTyping });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log(`${user.name} disconnected`);
  });
});
server.listen(PORT, () => console.log(`server listening on PORT: ${PORT}`));

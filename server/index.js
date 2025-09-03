import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Message from "./models/Message.js";
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

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "User:", socket.userId);

  socket.on("joinRoom", async (roomId) => {
    const room = await Room.findById(roomId);
    if (!room) return;
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, text }) => {
    if (!text) return;
    const message = await Message.create({
      room: roomId,
      sender: socket.userId,
      text,
    });

    io.to(roomId).emit("receiveMessage", {
      _id: message._id,
      room: roomId,
      sender: socket.userId,
      text: message.text,
      createdAt: message.createdAt,
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
server.listen(PORT, () => console.log(`server listening on PORT: ${PORT}`));

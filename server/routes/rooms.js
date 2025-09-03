import express from "express";
import Room from "../models/Room.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// /api/rooms
router.get("/", verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find().populate("users", "name email");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// /api/rooms
router.post("/", verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Room name is required" });

  try {
    const room = await Room.create({ name, users: [req.user._id] });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// /api/rooms/:roomId/join
router.post("/:roomId/join", verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.users.includes(req.user._id)) {
      room.users.push(req.user._id);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

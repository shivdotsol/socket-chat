import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);

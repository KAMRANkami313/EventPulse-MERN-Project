import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true }, // Storing formatted time string for simplicity
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
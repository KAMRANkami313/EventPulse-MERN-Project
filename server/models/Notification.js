import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Who receives the notification (Event Creator)
    fromUserId: { type: String, required: true }, // Who triggered it
    fromUserName: { type: String, required: true },
    type: { type: String, enum: ["like", "join", "comment","alert"], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    eventId: { type: String },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
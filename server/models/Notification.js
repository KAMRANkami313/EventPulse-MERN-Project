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

// 👇 THIS IS THE FIX: Ensures 1 User can send only 1 "Join" notification per Event.
// The partialFilterExpression makes the index ONLY active when the type is "join", 
// allowing multiple likes or comments on the same event.
NotificationSchema.index(
  { fromUserId: 1, eventId: 1, type: 1 }, 
  { unique: true, partialFilterExpression: { type: "join" } }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
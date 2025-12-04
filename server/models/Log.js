import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true }, // e.g., "DELETE_USER", "SEND_BROADCAST"
    target: { type: String }, // e.g., "User: John Doe" or "Event: Tech Talk"
    details: { type: String },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", LogSchema);
export default Log;
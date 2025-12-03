import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reporterId: { type: String, required: true },
    reporterName: { type: String, required: true },
    targetEventId: { type: String, required: true },
    eventTitle: { type: String, required: true }, // Store snapshot of title
    reason: { type: String, required: true }, // "Spam", "Inappropriate", etc.
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", ReportSchema);
export default Report;
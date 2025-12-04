import Log from "../models/Log.js";
import User from "../models/User.js";

export const createLog = async (adminId, action, target, details = "") => {
  try {
    const admin = await User.findById(adminId);
    if (!admin) return;

    const newLog = new Log({
      adminId,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action,
      target,
      details
    });

    await newLog.save();
    console.log(`📝 LOG: ${action} - ${target}`);
  } catch (err) {
    console.error("Logging failed:", err);
  }
};
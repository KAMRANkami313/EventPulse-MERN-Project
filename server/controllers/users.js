import User from "../models/User.js";
import Event from "../models/Event.js";
/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    // Security: Don't send the password back!
    const formattedUser = user.toObject();
    delete formattedUser.password;
    
    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ ALL USERS (For Admin) */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Don't send passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* DELETE USER (The Ban Hammer) */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Delete the User
    await User.findByIdAndDelete(id);

    // 2. Delete all Events created by this User (Cleanup)
    await Event.deleteMany({ userId: id });

    res.status(200).json({ message: "User and their events deleted successfully." });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE USER */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, location, occupation } = req.body;
    
    // Check if image was uploaded
    const picturePath = req.file ? req.file.filename : undefined;

    const updateData = {
      firstName,
      lastName,
      location,
      occupation
    };
    if (picturePath) updateData.picturePath = picturePath;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    // Remove password before sending back
    const formattedUser = updatedUser.toObject();
    delete formattedUser.password;

    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
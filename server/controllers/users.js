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
    
    // Get the full Cloudinary URL (.path) if a file is uploaded
    const picturePath = req.file ? req.file.path : undefined;

    const updateData = {
      firstName,
      lastName,
      location,
      occupation
    };
    
    // Only update picture if a new one was uploaded
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

/* NEW: ADD / REMOVE FRIEND (FOLLOW SYSTEM) */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    
    // Prevent following yourself
    if (id === friendId) return res.status(400).json({ message: "Cannot follow yourself" });

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      // Unfollow: Remove friendId from user's friends list
      user.friends = user.friends.filter((fid) => fid !== friendId);
      // Optional: If you want mutual following, uncomment below
      // friend.friends = friend.friends.filter((fid) => fid !== id); 
    } else {
      // Follow: Add friendId to user's friends list
      user.friends.push(friendId);
      // Optional: Mutual
      // friend.friends.push(id); 
    }
    
    await user.save();
    // await friend.save();

    // Send back the updated list of friends (formatted nicely)
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
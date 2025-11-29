import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    role: {
        type: String,
        enum: ["user", "admin", "organizer"],
        default: "user"
    },
    location: String,
    occupation: String,
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const User = mongoose.model("User", UserSchema);
export default User;
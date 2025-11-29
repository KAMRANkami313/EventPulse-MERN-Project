import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    creatorName: {
        type: String,
        required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    // NEW: Store Coordinates
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    picturePath: {
        type: String,
        default: "",
    },
    participants: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [], 
    },
    likes: {
      type: Map,
      of: Boolean,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);
export default Event;
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
    // Store Coordinates
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
    // NEW: Price Field for Payments
    price: { 
      type: Number, 
      default: 0 
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
    
    // --- START: NEW REVIEW FIELDS ---
    reviews: {
      type: [
        {
          userId: { type: String, required: true },
          firstName: { type: String, required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          text: { type: String },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    averageRating: {
        type: Number,
        default: 0
    },
    // --- END: NEW REVIEW FIELDS ---
    
    likes: {
      type: Map,
      of: Boolean,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);
export default Event;
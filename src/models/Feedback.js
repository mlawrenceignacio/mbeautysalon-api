import mongoose from "mongoose";
import User from "../models/User.js";

const feedbackSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      ref: User,
    },
    message: {
      type: String,
    },
    star: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

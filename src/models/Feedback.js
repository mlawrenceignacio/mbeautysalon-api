import mongoose from "mongoose";
import User from "../models/User.js";

const feedbackSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      ref: User,
    },
    username: {
      type: String,
      ref: User,
    },
    message: {
      type: String,
      default: "",
    },
    star: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

import mongoose from "mongoose";
import User from "../models/User.js";

const adminActivitySchema = new mongoose.Schema(
  {
    adminUsername: {
      type: String,
      required: true,
    },
    adminId: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    activityName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminActivity", adminActivitySchema);

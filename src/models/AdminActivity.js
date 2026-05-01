import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    addedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;

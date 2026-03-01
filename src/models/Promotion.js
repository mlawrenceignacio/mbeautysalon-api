import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    expiration: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Expired", "Active"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Promotion", promotionSchema);

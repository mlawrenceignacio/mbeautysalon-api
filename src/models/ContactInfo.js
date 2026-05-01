import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    contactName: {
      type: String,
      enum: ["instagram", "facebook", "x", "phone", "email", "address"],
      required: true,
    },
    value: {
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

export default mongoose.model("ContactInfo", contactSchema);

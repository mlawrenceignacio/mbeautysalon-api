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
  },
  { timestamps: true }
);

export default mongoose.model("ContactInfo", contactSchema);

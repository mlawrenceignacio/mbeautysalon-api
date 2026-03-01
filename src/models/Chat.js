import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
    },
    seenByAdmin: {
      type: Boolean,
      default: function () {
        return this.sender === "admin";
      },
    },
  },

  { timestamps: true },
);

export default mongoose.model("Chat", chatSchema);

import mongoose from "mongoose";
import User from "./User.js";

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "None",
    },
    service: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "UserConfirmed",
        "Confirmed",
        "Declined",
        "Cancelled",
        "Done",
      ],
      default: "Pending",
    },
    decisionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;

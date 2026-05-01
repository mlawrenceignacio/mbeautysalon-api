import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/Reservation.js";

dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for cleanup...");

    // $unset removes the specified field from the documents
    const result = await Reservation.updateMany(
      { service: { $exists: true } },
      { $unset: { service: "" } }
    );

    console.log(`Cleanup complete. ${result.modifiedCount} reservations cleaned.`);
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
};

cleanup();

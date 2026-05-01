import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/Reservation.js";
import Service from "../models/Service.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const reservations = await Reservation.find({ serviceId: { $exists: false } });
    console.log(`Found ${reservations.length} reservations to migrate.`);

    const services = await Service.find();
    
    let migratedCount = 0;

    for (const res of reservations) {
      // Find a matching service name
      // Note: In older versions, 'service' was a string.
      // We need to access it even if it's not in the current schema.
      const serviceName = res._doc.service; 
      
      if (!serviceName) {
        console.log(`Reservation ${res._id} has no service string. Skipping.`);
        continue;
      }

      const match = services.find(s => 
        s.service.toLowerCase().trim() === serviceName.toLowerCase().trim()
      );

      if (match) {
        res.serviceId = match._id;
        await res.save();
        migratedCount++;
      } else {
        console.log(`No service match found for "${serviceName}" (Reservation ${res._id}).`);
      }
    }

    console.log(`Migration complete. ${migratedCount} reservations updated.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();

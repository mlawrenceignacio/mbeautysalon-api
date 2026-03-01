import cron from "node-cron";
import Promotion from "../models/Promotion.js";

export const startPromotionCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();

      const result = await Promotion.updateMany(
        {
          expiration: { $lt: now },
          status: "Active",
        },
        {
          $set: { status: "Expired" },
        }
      );

      console.log(`[CRON] Promotions expired: ${result.modifiedCount}`);
    } catch (error) {
      console.error(error.message);
    }
  });
};

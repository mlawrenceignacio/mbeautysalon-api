import express from "express";
import {
  getAllAdminActivities,
  getAdminActivities,
  addAdminActivity,
} from "../controllers/adminActivityController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { validateAdminActivityInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/all", protect, adminOnly, getAllAdminActivities);
router.get("/:id", protect, adminOnly, getAdminActivities);
router.post(
  "/:id",
  protect,
  adminOnly,
  validateAdminActivityInput,
  addAdminActivity
);

export default router;

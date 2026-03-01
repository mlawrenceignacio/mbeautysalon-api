import express from "express";
import { validatePromotionInput } from "../middlewares/validateInput.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  addPromotion,
  getActivePromotions,
  getAllPromotions,
  updatePromotion,
} from "../controllers/promotionController.js";

const router = express.Router();

router.get("/all", protect, adminOnly, getAllPromotions);
router.get("/active-promotions", getActivePromotions);

router.post("/", protect, adminOnly, validatePromotionInput, addPromotion);

router.patch("/:id", protect, adminOnly, updatePromotion);

export default router;

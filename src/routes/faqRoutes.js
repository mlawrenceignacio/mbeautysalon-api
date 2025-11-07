import express from "express";
import {
  getFaq,
  addFaq,
  editFaq,
  deleteFaq,
} from "../controllers/faqController.js";
import { validateFaqInput } from "../middlewares/validateInput.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFaq);
router.post("/", protect, adminOnly, validateFaqInput, addFaq);
router.put("/:id", protect, adminOnly, validateFaqInput, editFaq);
router.delete("/:id", protect, adminOnly, validateFaqInput, deleteFaq);

export default router;

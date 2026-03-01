import express from "express";
import {
  getFaqs,
  addFaq,
  editFaq,
  deleteFaq,
} from "../controllers/faqController.js";
import { validateFaqInput } from "../middlewares/validateInput.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getFaqs);

router.post("/", protect, adminOnly, validateFaqInput, addFaq);
router.put("/:id", protect, adminOnly, validateFaqInput, editFaq);
router.delete("/:id", protect, adminOnly, deleteFaq);

export default router;

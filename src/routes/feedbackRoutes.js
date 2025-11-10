import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getFeedback,
  addFeedback,
  editFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { validateFeedbackInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/", getFeedback);
router.post("/", protect, validateFeedbackInput, addFeedback);
router.put("/:id", protect, validateFeedbackInput, editFeedback);
router.delete("/:id", protect, deleteFeedback);

export default router;

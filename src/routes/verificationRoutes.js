import express from "express";
import { sendVerification, confirmVerification } from "../controllers/verificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected — user must be logged in to request a verification email
router.post("/send-verification", protect, sendVerification);

// Public — clicked from the email link
router.get("/verify-email", confirmVerification);

export default router;

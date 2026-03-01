import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  getUserChats,
  sendMessage,
  getActiveUsers,
  markAsSeen,
  sendFaqAutoReply,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/users", protect, adminOnly, getActiveUsers);
router.put("/seen/:userId", protect, adminOnly, markAsSeen);
router.get("/:userId", protect, getUserChats);
router.post("/", protect, sendMessage);

router.post("/faq", protect, sendFaqAutoReply);

export default router;

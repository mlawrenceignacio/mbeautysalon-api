import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, getUser);

export default router;

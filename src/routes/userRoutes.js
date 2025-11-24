import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { editUser, getUser } from "../controllers/userController.js";
import { validateUserInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/", protect, getUser);
router.put("/", protect, validateUserInput, editUser);

export default router;

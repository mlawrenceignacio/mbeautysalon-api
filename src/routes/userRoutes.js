import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  editUser,
  getUsers,
  getAdmins,
  getUser,
  getThisUser,
} from "../controllers/userController.js";
import { validateUserInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/", protect, getUser);
router.get("/search/:userId", protect, adminOnly, getThisUser);

router.get("/web-users", protect, adminOnly, getUsers);
router.get("/admins", protect, adminOnly, getAdmins);
router.patch("/:id", protect, editUser);

export default router;

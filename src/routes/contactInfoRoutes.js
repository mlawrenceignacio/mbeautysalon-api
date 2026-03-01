import express from "express";
import {
  getContactInfos,
  addContactInfo,
  deleteContactInfo,
  updateContactInfo,
} from "../controllers/contactInfoController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateContactInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/all", getContactInfos);
router.post("/", protect, adminOnly, validateContactInput, addContactInfo);
router.patch("/:id", protect, adminOnly, updateContactInfo);
router.delete("/:id", protect, adminOnly, deleteContactInfo);

export default router;

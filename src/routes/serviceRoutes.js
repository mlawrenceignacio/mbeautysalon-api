import express from "express";
import {
  getServices,
  addService,
  editService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateServiceInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/", getServices);
router.post("/", protect, adminOnly, validateServiceInput, addService);
router.put("/:id", protect, adminOnly, validateServiceInput, editService);
router.delete("/:id", protect, adminOnly, validateServiceInput, deleteService);

export default router;

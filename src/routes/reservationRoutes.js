import express from "express";
import {
  getReservations,
  addReservation,
  editReservation,
  deleteReservation,
} from "../controllers/reservationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateReservationInput } from "../middlewares/validateInput.js";

const router = express.Router();

router.get("/", protect, adminOnly, getReservations);
router.post("/", protect, validateReservationInput, addReservation);
router.put(
  "/:id",
  protect,
  adminOnly,
  validateReservationInput,
  editReservation
);
router.delete("/:id", protect, adminOnly, deleteReservation);

export default router;

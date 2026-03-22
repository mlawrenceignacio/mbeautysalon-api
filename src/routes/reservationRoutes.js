import express from "express";
import {
  getUserReservation,
  getReservations,
  addReservation,
  editReservation,
  deleteReservation,
  cancelOwnReservation,
  confirmOwnReservation,
} from "../controllers/reservationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateReservationInput } from "../middlewares/validateInput.js";
import { updateReservationStatusWithReason } from "../controllers/reservationController.js";

const router = express.Router();

router.get("/me", protect, getUserReservation);
router.get("/all", protect, adminOnly, getReservations);
router.post("/", protect, validateReservationInput, addReservation);
router.put(
  "/:id",
  protect,
  adminOnly,
  validateReservationInput,
  editReservation,
);
router.patch("/:id/status", protect, adminOnly, editReservation);
router.patch(
  "/:id/status-with-reason",
  protect,
  adminOnly,
  updateReservationStatusWithReason,
);
router.patch("/:id/status-own-reservation", protect, cancelOwnReservation);
router.patch("/:id/confirm-own-reservation", protect, confirmOwnReservation);

router.delete("/:id", protect, adminOnly, deleteReservation);

export default router;

import express from "express";
import {
  getUserReservation,
  getReservations,
  addReservation,
  editReservation,
  deleteReservation,
} from "../controllers/reservationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateReservationInput } from "../middlewares/validateInput.js";
import {
  confirmReservationFromEmail,
  cancelReservationFromEmail,
  sendConfirmationEmail,
  updateReservationStatusWithReason,
} from "../controllers/reservationController.js";

const router = express.Router();

router.get("/me", protect, getUserReservation);
router.get("/all", protect, adminOnly, getReservations);
router.post("/", protect, validateReservationInput, addReservation);
router.put(
  "/:id",
  protect,
  adminOnly,
  validateReservationInput,
  editReservation
);
router.patch("/:id/status", protect, adminOnly, editReservation);
router.patch(
  "/:id/status-with-reason",
  protect,
  adminOnly,
  updateReservationStatusWithReason
);

router.delete("/:id", protect, adminOnly, deleteReservation);

router.post(
  "/:id/send-confirmation",
  protect,
  adminOnly,
  sendConfirmationEmail
);
router.get("/confirm/:token", confirmReservationFromEmail);
router.get("/cancel/:token", cancelReservationFromEmail);

export default router;

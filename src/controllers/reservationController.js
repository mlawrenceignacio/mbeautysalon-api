import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { sendReservationStatusEmail } from "../utils/emailService.js";

const formatService = (service) => {
  if (Array.isArray(service)) return service.join(", ");
  if (service == null) return "N/A";
  return String(service);
};

export const getUserReservation = async (req, res) => {
  try {
    const reservations = await Reservation.find({ email: req.user.email }).populate("serviceId");

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("getUserReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("serviceId");

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("getReservations error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addReservation = async (req, res) => {
  try {
    // Block unverified users from booking
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before booking a reservation.",
      });
    }

    const {
      date,
      time,
      clientName,
      email,
      phone,
      address,
      note,
      serviceId,
      status,
    } = req.body;

    const newReservation = await Reservation.create({
      userId: req.user._id,
      date,
      time,
      clientName,
      address,
      phone,
      email,
      note: note?.trim() ? note.trim() : "None",
      serviceId,
      status: status || "Pending",
    });

    return res.status(201).json({
      message: "Reservation added!",
      newReservation,
    });
  } catch (error) {
    console.error("addReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Reservation edited successfully!",
      updatedReservation,
    });
  } catch (error) {
    console.error("editReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const cancelOwnReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending reservations can be cancelled.",
      });
    }

    reservation.status = "Cancelled";
    await reservation.save();

    return res.status(200).json({
      message: "Reservation cancelled successfully.",
      reservation,
    });
  } catch (error) {
    console.error("cancelOwnReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    return res.status(200).json({ message: "Reservation deleted." });
  } catch (error) {
    console.error("deleteReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const confirmOwnReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending reservations can be confirmed by user.",
      });
    }

    reservation.status = "UserConfirmed";
    await reservation.save();

    return res.status(200).json({
      message: "Reservation confirmed successfully.",
      reservation,
    });
  } catch (error) {
    console.error("confirmOwnReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateReservationStatusWithReason = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const requiresReason = ["Declined", "Cancelled"];

    if (requiresReason.includes(status) && !reason?.trim()) {
      return res
        .status(400)
        .json({ message: "Reason is required for this action." });
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (status === "Cancelled" && reservation.status !== "Confirmed") {
      return res.status(400).json({
        message: "Only confirmed reservations can be cancelled.",
      });
    }

    reservation.status = status;
    reservation.decisionReason = reason?.trim() || undefined;
    reservation.handledByAdminId = req.user._id;

    await reservation.save();

    // Populate service for email
    await reservation.populate("serviceId");

    // Send notification email (best-effort — don't fail the request if email fails)
    if (requiresReason.includes(status)) {
      try {
        await sendReservationStatusEmail({
          to: reservation.email,
          clientName: reservation.clientName,
          service: reservation.serviceId?.service || "N/A",
          date: reservation.date,
          time: reservation.time,
          status,
          reason: reason?.trim(),
        });
      } catch (emailErr) {
        console.error("Failed to send reservation status email:", emailErr.message);
      }
    }

    return res.status(200).json({
      message: `Reservation ${status} successfully.`,
      reservation,
    });
  } catch (error) {
    console.error("updateReservationStatusWithReason error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

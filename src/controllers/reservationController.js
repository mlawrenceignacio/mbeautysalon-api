import Reservation from "../models/Reservation.js";
import crypto from "crypto";
const formatService = (service) => {
  if (Array.isArray(service)) return service.join(", ");
  if (service == null) return "N/A";
  return String(service);
};

const getBaseUrl = () => {
  const raw = process.env.BACKEND_URL;
  if (!raw) {
    throw new Error("BACKEND_URL is not configured.");
  }
  return raw.replace(/\/$/, "");
};

export const getUserReservation = async (req, res) => {
  try {
    const reservations = await Reservation.find({ email: req.user.email });

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("getUserReservation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error("getReservations error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addReservation = async (req, res) => {
  try {
    const {
      date,
      time,
      clientName,
      email,
      phone,
      address,
      note,
      service,
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
      service,
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

    await reservation.save();

    if (requiresReason.includes(status)) {
      await sendEmail({
        to: reservation.email,
        subject: `Your reservation has been ${status}`,
        html: `
          <h2>Reservation ${status}</h2>
          <p>Hello ${reservation.clientName},</p>
          <p>
            Your reservation for <b>${formatService(reservation.service)}</b> on
            <b>${reservation.date}</b> at <b>${reservation.time}</b> has been
            <b>${status}</b>.
          </p>

          <p><b>Reason:</b></p>
          <p style="background:#f4f4f4;padding:10px;border-radius:5px;">
            ${reason}
          </p>

          <p>If you have questions, feel free to contact us.</p>
        `,
      });
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

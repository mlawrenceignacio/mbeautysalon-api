import Reservation from "../models/Reservation.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

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
    const reservations = await Reservation.find({ userId: req.user._id });

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

    if (
      req.body.status === "Confirmed" &&
      reservation.status !== "UserConfirmed"
    ) {
      return res.status(400).json({ message: "User has not confirmed yet." });
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

export const sendConfirmationEmail = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (!reservation.email) {
      return res.status(400).json({ message: "Reservation email is missing." });
    }

    if (!["Pending", "EmailSent"].includes(reservation.status)) {
      return res.status(400).json({
        message: `Cannot send confirmation for reservation with status "${reservation.status}".`,
      });
    }

    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
    if (!backendUrl) {
      return res.status(500).json({
        message: "BACKEND_URL is not configured on the server.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    reservation.confirmationToken = token;
    await reservation.save();

    const confirmUrl = `${backendUrl}/api/reservations/confirm/${token}`;
    const cancelUrl = `${backendUrl}/api/reservations/cancel/${token}`;

    await sendEmail({
      to: reservation.email,
      subject: "Confirm Your Reservation",
      html: `
        <h2>Reservation Confirmation</h2>
        <p><b>Name:</b> ${reservation.clientName}</p>
        <p><b>Service:</b> ${reservation.service}</p>
        <p><b>Date:</b> ${reservation.date}</p>
        <p><b>Time:</b> ${reservation.time}</p>

        <p>Please confirm your reservation by clicking below:</p>

        <a
          href="${confirmUrl}"
          style="display:inline-block;padding:10px 15px;background:#790808;color:white;border-radius:5px;text-decoration:none;"
        >
          Confirm
        </a>

        <br /><br />

        <a href="${cancelUrl}" style="color:red;">
          Cancel Reservation
        </a>
      `,
    });

    reservation.status = "EmailSent";
    await reservation.save();

    return res.status(200).json({
      message: "Confirmation email sent successfully.",
    });
  } catch (error) {
    console.error("sendConfirmationEmail error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    return res.status(500).json({
      message: "Failed to send confirmation email.",
      error: error.message,
    });
  }
};

export const confirmReservationFromEmail = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      confirmationToken: req.params.token,
    });

    if (!reservation) {
      return res.status(400).send("Invalid or expired token.");
    }

    reservation.status = "UserConfirmed";
    reservation.confirmationToken = undefined;
    await reservation.save();

    return res.redirect(`${process.env.FRONTEND_WEB_URL}/confirmed`);
  } catch (error) {
    console.error("confirmReservationFromEmail error:", error);
    return res.status(500).send("Server Error");
  }
};

export const cancelReservationFromEmail = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      confirmationToken: req.params.token,
    });

    if (!reservation) {
      return res.status(404).send("Invalid or expired token.");
    }

    reservation.status = "Cancelled";
    reservation.confirmationToken = undefined;
    await reservation.save();

    return res.send("Reservation cancelled.");
  } catch (error) {
    console.error("cancelReservationFromEmail error:", error);
    return res.status(500).send("Server Error");
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

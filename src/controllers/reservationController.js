import Reservation from "../models/Reservation.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const getUserReservation = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id });
    if (!reservations)
      return res.status(404).json({ message: "No reservation found." });

    return res.status(200).json({ reservations });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();

    if (!reservations)
      return res.status(404).json({ message: "Reservations not found." });

    return res.status(200).json({ reservations });
  } catch (error) {
    console.error(error.message);
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
      note: note ? note : "None",
      service,
      status: status ? status : "Pending",
    });

    return res.status(201).json({
      message: "Reservation added!",
      newReservation,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (
      req.body.status === "Confirmed" &&
      reservation.status !== "UserConfirmed"
    ) {
      return res.status(400).json({ message: "User has not confirmed yet." });
    }

    return res.status(200).json({
      message: "Reservation edited succesfully!",
      updatedReservation,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    await Reservation.findByIdAndDelete(id);

    return res.status(200).json({ message: "Reservation deleted." });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const sendConfirmationEmail = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({ message: "Confirmation already sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
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

        <a href="${confirmUrl}" style="padding:10px 15px;background:#790808;color:white;border-radius:5px;text-decoration:none;">Confirm</a>
        <br/><br/>
        <a href="${cancelUrl}" style="color:red;">Cancel Reservation</a>
      `,
    });

    reservation.confirmationToken = token;
    reservation.status = "EmailSent";
    await reservation.save();

    return res.json({ message: "Confirmation email sent" });
  } catch (error) {
    console.error("sendConfirmationEmail error:", error);
    return res.status(500).json({
      message: "Failed to send confirmation email",
      error: error.message,
    });
  }
};

export const confirmReservationFromEmail = async (req, res) => {
  const reservation = await Reservation.findOne({
    confirmationToken: req.params.token,
  });

  if (!reservation) return res.status(400).send("Invalid o expired token.");

  reservation.status = "UserConfirmed";
  reservation.confirmationToken = undefined;
  await reservation.save();

  res.redirect(`${process.env.FRONTEND_WEB_URL}/confirmed`);
};

export const cancelReservationFromEmail = async (req, res) => {
  const reservation = await Reservation.findOne({
    confirmationToken: req.params.token,
  });

  if (!reservation) return res.status(404).send("Invalid or epxired token.");

  reservation.status = "Cancelled";
  reservation.confirmationToken = undefined;
  await reservation.save();

  res.send("Reservation cancelled.");
};

// src/controllers/reservationController.js
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
    reservation.decisionReason = reason || undefined;

    await reservation.save();

    if (requiresReason.includes(status)) {
      await sendEmail({
        to: reservation.email,
        subject: `Your reservation has been ${status}`,
        html: `
          <h2>Reservation ${status}</h2>
          <p>Hello ${reservation.clientName},</p>
          <p>Your reservation for <b>${reservation.service}</b> on 
          <b>${reservation.date}</b> at <b>${reservation.time}</b> has been <b>${status}</b>.</p>

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
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

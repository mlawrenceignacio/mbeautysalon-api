import Reservation from "../models/Reservation.js";

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
      label,
      email,
      phone,
      address,
      note,
      service,
    } = req.body;

    const newReservation = await Reservation.create({
      date,
      time,
      clientName,
      address,
      phone,
      email,
      label,
      note,
      service,
    });

    return res.status(201).json({
      message: "Reservation added!",
      reservation: {
        date: newReservation.date,
        time: newReservation.time,
        clientName: newReservation.clientName,
        phone: newReservation.phone,
        email: newReservation.email,
        label: newReservation.label,
        note: newReservation.note,
        service: newReservation.service,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editReservation = async (req, res) => {
  try {
    const {
      date,
      time,
      clientName,
      address,
      phone,
      email,
      label,
      note,
      service,
    } = req.body;
    const { id } = req.params;

    const existingReservation = await Reservation.findById(id);
    if (!existingReservation)
      return res.status(404).json({ message: "Reservation not found." });

    const newReservation = await Reservation.findByIdAndUpdate(id, {
      date,
      time,
      clientName,
      address,
      phone,
      email,
      label,
      note,
      service,
    });

    return res.status(200).json({
      message: "Reservation edited succesfully!",
      reservation: {
        date: newReservation.date,
        time: newReservation.time,
        clientName: newReservation.clientName,
        address: newReservation.address,
        phone: newReservation.phone,
        email: newReservation.email,
        label: newReservation.label,
        note: newReservation.note,
        service: newReservation.service,
      },
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

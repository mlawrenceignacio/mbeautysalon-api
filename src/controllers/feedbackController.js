import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();

    if (!feedbacks)
      return res.status(404).json({ message: "No feedbacks found." });

    return res.status(200).json({ feedbacks });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { message, star, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const newFeedback = await Feedback.create({
      email: user.email,
      username: user.username,
      message: message ? message : "",
      star,
    });

    return res.status(201).json({ message: "Feedback sent!", newFeedback });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editFeedback = async (req, res) => {
  try {
    const { email, message, star } = req.body;
    const { id } = req.params;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const newFeedback = await Feedback.findByIdAndUpdate(id, {
      username: user.username,
      message: message ? message : "",
      star,
    });

    return res.status(200).json({ message: "Feedback edited!", newFeedback });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);

    return res.status(200).json({ message: "Feedback deleted." });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "email username")
      .sort({ createdAt: -1 });

    if (!feedbacks)
      return res.status(404).json({ message: "No feedbacks found." });

    // Map to keep the response shape consistent for frontend/mobile
    const mapped = feedbacks.map((fb) => ({
      _id: fb._id,
      email: fb.userId?.email || "Deleted User",
      username: fb.userId?.username || "Unknown",
      userId: fb.userId?._id || null,
      message: fb.message,
      star: fb.star,
      createdAt: fb.createdAt,
      updatedAt: fb.updatedAt,
    }));

    return res.status(200).json({ feedbacks: mapped });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { message, star } = req.body;

    // Use the authenticated user's ID directly
    const userId = req.user._id;

    const newFeedback = await Feedback.create({
      userId,
      message: message || "",
      star,
    });

    const user = await User.findById(userId).select("email username");

    return res.status(201).json({
      message: "Feedback sent!",
      newFeedback: {
        _id: newFeedback._id,
        email: user?.email,
        username: user?.username,
        userId: user?._id,
        message: newFeedback.message,
        star: newFeedback.star,
        createdAt: newFeedback.createdAt,
        updatedAt: newFeedback.updatedAt,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editFeedback = async (req, res) => {
  try {
    const { message, star } = req.body;
    const { id } = req.params;

    const existing = await Feedback.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Feedback not found." });

    // Only the owner can edit their feedback
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    existing.message = message || "";
    existing.star = star;
    await existing.save();

    const user = await User.findById(req.user._id).select("email username");

    return res.status(200).json({
      message: "Feedback edited!",
      newFeedback: {
        _id: existing._id,
        email: user?.email,
        username: user?.username,
        userId: user?._id,
        message: existing.message,
        star: existing.star,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      },
    });
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

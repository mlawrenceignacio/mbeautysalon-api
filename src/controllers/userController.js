import User from "../models/User.js";

export const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No user authenticated." });
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

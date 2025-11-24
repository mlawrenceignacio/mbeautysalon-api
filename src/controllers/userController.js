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

export const editUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      {
        username,
      }
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Username edited successfully!", user });
  } catch (error) {
    console.error(error.message);
  }
};

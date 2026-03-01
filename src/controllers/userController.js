import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No user authenticated." });
    }

    const users = await User.find({ role: { $ne: "admin" } });

    if (!users) {
      return res.status(404).json({ message: "No user found." });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUser = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getThisUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      console.log("No user id.");
      return res.status(400).json({ message: "Bad Request" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ user });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAdmins = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No user authenticated." });
    }

    const admins = await User.find({ role: { $ne: "user" } });

    if (!admins) return res.status(404).json({ message: "No admin found." });

    return res.status(200).json({ admins });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true, new: true },
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });

    res
      .status(200)
      .json({ message: "User updated successfully!", updatedUser });
  } catch (error) {
    console.error(error.message);
  }
};

import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No user authenticated." });
    }

    const users = await User.find({ role: { $ne: "admin" } }).select("-password");

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

    return res.status(200).json({
      user: {
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
      },
    });
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

    const user = await User.findById(userId).select("-password");
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

    const admins = await User.find({ role: { $ne: "user" } }).select("-password");

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

    // Only allow username updates (prevent role/email/password manipulation)
    const { username } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { username } },
      { runValidators: true, new: true },
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });

    res
      .status(200)
      .json({ message: "User updated successfully!", updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

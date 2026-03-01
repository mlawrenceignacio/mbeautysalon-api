import AdminActivity from "../models/AdminActivity.js";
import User from "../models/User.js";

export const getAllAdminActivities = async (req, res) => {
  try {
    const activities = await AdminActivity.find()
      .sort({ createdAt: -1 })
      .limit(40);

    if (!activities)
      return res.status(404).json({ message: "No admin activity found." });

    return res.status(200).json({ activities });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAdminActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await AdminActivity.find({ adminId: id })
      .sort({
        createdAt: -1,
      })
      .limit(40);

    if (!found)
      return res
        .status(404)
        .json({ message: "No activity found from this admin." });

    return res.status(200).json({ found });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addAdminActivity = async (req, res) => {
  try {
    const { adminUsername, activityName, adminEmail } = req.body;
    const { id } = req.params;

    if (!adminUsername || !activityName || !adminEmail) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const admin = await User.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    const newAdminActivity = await AdminActivity.create({
      adminUsername,
      adminId: id,
      activityName,
      adminEmail,
    });

    return res.status(201).json({ newAdminActivity });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

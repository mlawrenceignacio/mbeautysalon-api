import AdminActivity from "../models/AdminActivity.js";
import User from "../models/User.js";

export const getAllAdminActivities = async (req, res) => {
  try {
    const activities = await AdminActivity.find()
      .populate("adminId", "username email")
      .sort({ createdAt: -1 })
      .limit(40);

    if (!activities)
      return res.status(404).json({ message: "No admin activity found." });

    // Map to keep backward-compatible response shape
    const mapped = activities.map((a) => ({
      _id: a._id,
      adminId: a.adminId?._id || null,
      adminUsername: a.adminId?.username || "Unknown",
      adminEmail: a.adminId?.email || "Unknown",
      activityName: a.activityName,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return res.status(200).json({ activities: mapped });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAdminActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await AdminActivity.find({ adminId: id })
      .populate("adminId", "username email")
      .sort({ createdAt: -1 })
      .limit(40);

    if (!activities)
      return res
        .status(404)
        .json({ message: "No activity found from this admin." });

    const mapped = activities.map((a) => ({
      _id: a._id,
      adminId: a.adminId?._id || null,
      adminUsername: a.adminId?.username || "Unknown",
      adminEmail: a.adminId?.email || "Unknown",
      activityName: a.activityName,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return res.status(200).json({ found: mapped });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addAdminActivity = async (req, res) => {
  try {
    const { activityName } = req.body;
    const { id } = req.params;

    if (!activityName) {
      return res.status(400).json({ message: "Activity name is required." });
    }

    const admin = await User.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    const newAdminActivity = await AdminActivity.create({
      adminId: id,
      activityName,
    });

    // Return with populated data for consistency
    return res.status(201).json({
      newAdminActivity: {
        _id: newAdminActivity._id,
        adminId: admin._id,
        adminUsername: admin.username,
        adminEmail: admin.email,
        activityName: newAdminActivity.activityName,
        createdAt: newAdminActivity.createdAt,
        updatedAt: newAdminActivity.updatedAt,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

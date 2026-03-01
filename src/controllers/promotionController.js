import Promotion from "../models/Promotion.js";

export const getActivePromotions = async (req, res) => {
  try {
    const today = new Date();

    const promotions = await Promotion.find({
      expiration: { $gte: today },
      status: "Active",
    }).sort({ expiration: 1 });

    return res.status(200).json({ promotions });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ message: "Server Error" });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });

    return res.status(200).json({ promotions });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ message: "Server Error" });
  }
};

export const addPromotion = async (req, res) => {
  try {
    const { name, description, category, expiration, status } = req.body;

    const newPromotion = await Promotion.create({
      name,
      description,
      category,
      expiration,
      status: status ? status : "Active",
    });

    return res.status(201).json({
      message: "Promotion added successfully!",
      promotion: {
        name: newPromotion.name,
        description: newPromotion.description,
        category: newPromotion.category,
        expiration: newPromotion.expiration,
        status: newPromotion.status,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedPromotion)
      return res.status(404).json({ message: "Promotion not found." });

    return res
      .status(200)
      .json({ message: "Promotion updated successfully!", updatedPromotion });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

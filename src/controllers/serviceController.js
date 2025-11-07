import Service from "../models/Service.js";

export const getServices = async (req, res) => {
  try {
    const services = await Service.find();

    if (!services)
      return res.status(404).json({ message: "Services not found." });

    return res.status(200).json({ services });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addService = async (req, res) => {
  try {
    const { category, service } = req.body;

    const newService = await Service.create({
      category,
      service,
    });

    return res.status(201).json({
      message: "Service added to the list!",
      service: {
        category: newService.category,
        service: newService.service,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editService = async (req, res) => {
  try {
    const { category, service } = req.body;
    const { id } = req.params;

    const existingService = await Service.findById(id);
    if (!existingService)
      return res.status(404).json({ message: "Service not found." });

    const newService = await Service.findByIdAndUpdate(id, {
      category,
      service,
    });

    return res.status(200).json({
      message: "Service edited succesfully!",
      service: {
        category: newService.category,
        service: newService.service,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await Service.findByIdAndDelete(id);

    return res.status(200).json({ message: "Service deleted." });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

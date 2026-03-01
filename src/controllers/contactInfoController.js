import ContactInfo from "../models/ContactInfo.js";

export const getContactInfos = async (req, res) => {
  try {
    const contacts = await ContactInfo.find();
    if (!contacts)
      return res
        .status(404)
        .json({ message: "No contact informations found." });

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedContact = await ContactInfo.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true, runValidators: true }
    );

    if (!updatedContact)
      return res.status(404).json({ message: "Contact Info not found." });

    return res.status(200).json({
      message: "Contact Info updated successfully!",
      updatedContact,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addContactInfo = async (req, res) => {
  try {
    const { name, val } = req.body;

    if (!name || !val)
      return res.status(400).json({ message: "Missing required fields." });

    const newContact = await ContactInfo.create({
      contactName: name,
      value: val,
    });

    return res
      .status(201)
      .json({ message: "Contact created successfully!", newContact });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteContactInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactInfo.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Contact Info deleted successfully!", deleted });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

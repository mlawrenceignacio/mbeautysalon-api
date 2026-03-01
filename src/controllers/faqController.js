import Faq from "../models/FAQ.js";

export const getFaqs = async (req, res) => {
  try {
    const faq = await Faq.find();
    if (!faq) return res.status(404).json({ message: "FAQ not found." });

    return res.status(200).json({
      faq,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const existingFaq = await Faq.findOne({ question });
    if (existingFaq) {
      return res.status(400).json({ message: "This question already exists." });
    }

    const newFaq = await Faq.create({
      question,
      answer,
    });

    return res.status(201).json({
      message: "New FAQ added on the list!",
      faq: {
        question: newFaq.question,
        answer: newFaq.answer,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const { id } = req.params;

    const faq = await Faq.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found." });

    const existingFaq = await Faq.findOne({
      question,
      _id: { $ne: id },
    });

    if (existingFaq) {
      return res.status(400).json({ message: "This question already exists." });
    }

    const newFaq = await Faq.findByIdAndUpdate(
      id,
      {
        question,
        answer,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "FAQ edited successfully!",
      faq: {
        question: newFaq.question,
        answer: newFaq.answer,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    await Faq.findByIdAndDelete(id);

    return res.status(200).json({ message: "FAQ deleted." });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

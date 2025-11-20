import Joi from "joi";

export const validateAuthInput = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: false }).required().messages({
      "string.empty": "Email is required.",
      "string.email": "Please enter a valid email address",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

export const validateFaqInput = (req, res, next) => {
  const schema = Joi.object({
    question: Joi.string().required().messages({
      "string.empty": "Question is required.",
    }),
    answer: Joi.string().required().messages({
      "string.empty": "Answer is required.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

export const validateServiceInput = (req, res, next) => {
  const schema = Joi.object({
    category: Joi.string().required().messages({
      "string.empty": "Category field is Required.",
    }),
    service: Joi.string().required().messages({
      "string.empty": "Service field is required.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

export const validateReservationInput = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.string().required().messages({
      "string.empty": "Date field is required.",
    }),
    time: Joi.string().required().messages({
      "string.empty": "Time field is required.",
    }),
    label: Joi.string().required().messages({
      "string.empty": "Label field is required.",
    }),
    clientName: Joi.string().required().messages({
      "string.empty": "Client name is required.",
    }),
    email: Joi.string().email({ tlds: false }).required().messages({
      "string.empty": "Email field is required.",
      "string.email": "Please enter a valid email address.",
    }),
    phone: Joi.string().min(11).required().messages({
      "string.empty": "Phone field is required.",
      "string.min": "Please enter a valid phone number.",
    }),
    address: Joi.string().required().messages({
      "string.empty": "Address field is required.",
    }),
    note: Joi.string(),
    service: Joi.string().required().messages({
      "string.empty": "Service field is required.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

export const validateFeedbackInput = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required.",
      "string.email": "Please enter a valid email address.",
    }),
    message: Joi.string().allow(""),
    star: Joi.number().valid(1, 2, 3, 4, 5).required().messages({
      "any.only": "Star must be 1, 2, 3, 4, or 5.",
      "number.empty": "Please enter your star review.",
      "number.min": "Please enter at least one star.",
      "number.max": "Please enter a star between 1-5 only.",
      "any.required": "Star rating is required.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};

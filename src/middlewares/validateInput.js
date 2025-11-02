import Joi from "joi";

export const validateInput = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: false }).required().messages({
      "string.empty": "Email required.",
      "string.email": "Please enter a valid email address",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Password required.",
      "string.min": "Password must be at least 8 characters.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

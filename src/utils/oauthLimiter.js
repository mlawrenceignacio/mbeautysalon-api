import rateLimit from "express-rate-limit";

export const oauthLimiter = rateLimit({
  windowMs: 1000 * 60 * 5,
  max: 20,
  message: "Too many OAuth attempts, please try again later.",
});

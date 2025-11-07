import express from "express";
import passport from "passport";
import "../config/passport.js";

import { signUp, login, logout } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateAuthInput } from "../middlewares/validateInput.js";
import { googleCallback } from "../controllers/googleAuthController.js";
import { oauthLimiter } from "../utils/oauthLimiter.js";

const router = express.Router();

router.post("/signup", validateAuthInput, signUp);
router.post("/login", validateAuthInput, login);
router.post("/logout", protect, logout);

router.get("/google", oauthLimiter, (req, res, next) => {
  const platform = req.query.platform;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: platform,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;

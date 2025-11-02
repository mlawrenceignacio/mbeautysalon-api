import { setTokenCookie } from "./authController.js";
import { generateToken } from "../utils/generateToken.js";

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Google Auth Failed." });

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    const redirectUrl =
      user._platform === "mobile"
        ? `${process.env.MOBILE_REDIRECT_URL}?token=${token}`
        : process.env.WEB_REDIRECT_URL;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};

import crypto from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/emailService.js";

/**
 * POST /api/auth/send-verification
 * Sends (or re-sends) a verification email to the authenticated user.
 */
export const sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h
    await user.save();

    await sendVerificationEmail(user.email, token);

    return res.status(200).json({ message: "Verification email sent! Check your inbox." });
  } catch (error) {
    console.error("sendVerification error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET /api/auth/verify-email?token=xxx
 * Public endpoint — the user clicks this link in their email.
 */
export const confirmVerification = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(buildPage("Invalid Link", "No verification token provided.", false));
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).send(
        buildPage("Link Expired", "This verification link is invalid or has expired. Please request a new one from the reservation page.", false)
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const frontendUrl = (process.env.FRONTEND_WEB_URL || "http://localhost:5173").replace(/\/$/, "");

    return res.status(200).send(
      buildPage(
        "Email Verified! ✅",
        `Your email has been verified successfully. You can now book reservations.<br><br><a href="${frontendUrl}/reservation" style="background:#790808;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Reservation</a>`,
        true
      )
    );
  } catch (error) {
    console.error("confirmVerification error:", error);
    return res.status(500).send(buildPage("Server Error", "Something went wrong. Please try again later.", false));
  }
};

function buildPage(title, body, success) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title} — MBeautyQueen Salon</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff5f7; }
        .card { text-align: center; max-width: 420px; padding: 40px 32px; border-radius: 16px; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        h1 { color: ${success ? "#16a34a" : "#dc2626"}; margin-bottom: 12px; }
        p { color: #444; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${title}</h1>
        <p>${body}</p>
      </div>
    </body>
    </html>
  `;
}

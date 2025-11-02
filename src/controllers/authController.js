import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });
};

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const apiKey = req.headers["x-api-key"];

    let role = "user";
    if (apiKey && apiKey === process.env.MOBILE_API_KEY) {
      role = "admin";
    } else if (apiKey && apiKey !== process.env.WEB_API_KEY) {
      return res.status(403).json({ message: "Invalid client source." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    const newUser = await User.create({ email, password, role });
    const token = generateToken(newUser._id);

    setTokenCookie(res, token);

    res.status(201).json({
      message: "Registered successfully",
      user: {
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Sign Up Error: ", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const apiKey = req.headers["x-api-key"];

    if (
      apiKey &&
      apiKey !== process.env.WEB_API_KEY &&
      apiKey !== process.env.MOBILE_API_KEY
    ) {
      return res.status(403).json({ message: "Invalid client source." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    if (apiKey === process.env.MOBILE_API_KEY && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully!" });
};

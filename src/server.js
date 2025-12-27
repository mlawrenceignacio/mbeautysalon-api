import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { sanitizeRequest } from "./middlewares/sanitizeMiddleware.js";
import rateLimit from "express-rate-limit";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(sanitizeRequest);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started at port ${PORT}...\n`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

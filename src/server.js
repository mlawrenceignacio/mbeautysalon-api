import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { sanitizeRequest } from "./middlewares/sanitizeMiddleware.js";
import rateLimit from "express-rate-limit";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

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
    origin: "http://localhost:5173", // Set to true if ita-try mo sa network for host (cp), ok ok?
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}...\n`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

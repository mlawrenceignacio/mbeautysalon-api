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
import contactRoutes from "./routes/contactInfoRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import adminActivityRoutes from "./routes/adminActivityRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { startPromotionCron } from "./cron/promotionCron.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

io.engine.on("connection_error", (err) => {
  console.log("Socket connection error:", err.message);
});

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("joinRoom", (room) => {
    socket.join(room);
  });

  socket.on("joinAdmins", () => {
    socket.join("admins");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

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
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/health", (req, res) => res.status(200).send("ok"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/contact-info", contactRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/admin-activity", adminActivityRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 10000;

connectDB()
  .then(() => {
    startPromotionCron();
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started at port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

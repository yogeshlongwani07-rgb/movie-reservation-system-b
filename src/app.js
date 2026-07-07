const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const passport = require("./config/passport");

const adminRoutes = require("./routes/admin");
const movieListingRoutes = require("./routes/movie");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const corsOptions =
    process.env.NODE_ENV === "production"
      ? {
          origin: process.env.ALLOWED_ORIGINS?.split(",") || frontendUrl,
          credentials: true,
        }
      : { origin: frontendUrl, credentials: true };

  app.use(cors(corsOptions));

  if (process.env.NODE_ENV === "production") {
    app.use(helmet());

    app.use(limiter);
  }

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(passport.initialize());

  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/movie", movieListingRoutes);
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/auth", authRoutes);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "All Set" });
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route '${req.originalUrl}' not found`,
    });
  });

  return app;
}

module.exports = createApp;

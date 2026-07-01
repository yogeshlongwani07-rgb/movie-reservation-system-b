const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const adminRoutes = require("./routes/admin");
const movieListingRoutes = require("./routes/movie");
const userRoutes = require("./routes/user");

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

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );

  if (process.env.NODE_ENV === "production") {
    app.use(helmet());

    app.use(
      cors({
        origin: true,
        credentials: true,
      }),
    );

    app.use(limiter);
  }

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/movie", movieListingRoutes);
  app.use("/api/v1/user", userRoutes);

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

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("./config/passport");
const { limiter } = require("../src/middleware/rateLimiter");
const adminRoutes = require("./routes/admin");
const movieListingRoutes = require("./routes/movie");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const { corsOptions } = require("./Constants");
const errorHandler = require("../src/middleware/errorHandler");


function createApp() {
  const app = express();

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
  app.use(errorHandler);
  return app;
}

module.exports = createApp;

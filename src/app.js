const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const { limiter } = require("../src/middleware/rateLimiter");
const adminRoutes = require("./routes/admin");
const movieListingRoutes = require("./routes/movie");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const { corsOptions } = require("./Constants");
const errorHandler = require("../src/middleware/errorHandler");
const Oauth2Routes = require("./routes/oauth2");

function createApp() {
  const app = express();
  app.use(limiter);
  app.use(cors(corsOptions));

  if (process.env.NODE_ENV === "production") {
    app.use(helmet());
  }

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/movie", movieListingRoutes);
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/payment", paymentRoutes);
  app.use("/api/v1/o/auth", Oauth2Routes);

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

const express = require("express");
const cookieParser = require("cookie-parser");

const adminRoutes = require("./routes/admin");
const movieListingRoutes = require("./routes/movie");
const userRoutes = require("./routes/user");

function createApp() {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use("/admin", adminRoutes);
  app.use("/movie", movieListingRoutes);
  app.use("/user", userRoutes);

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

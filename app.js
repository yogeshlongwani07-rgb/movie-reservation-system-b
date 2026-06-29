require("dotenv").config();
const requiredEnvVars = ["MONGO_URL", "SECRET_JWT", "SALT_ROUNDS", "PASSKEY"];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`${varName} not found`);
    process.exit(1);
  }
}
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
  app.use(limiter);
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
}

const port = process.env.PORT || 3000;
const connectToDb = require("./src/config/connect");
const adminRoutes = require("./src/routes/admin");
const cookieParser = require("cookie-parser");
const movieListingRoutes = require("./src/routes/movie-listing");
const userRoutes = require("./src/routes/user");
connectToDb();

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
app.listen(port, () => {
  console.log("Server Running");
});

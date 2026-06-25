require("dotenv").config();
if (!process.env.SECRET_JWT) {
  console.error("SECRET_JWT not found");
  process.exit(1);
}
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const connectToDb = require("./src/DB/connect");
const adminRoutes = require("./src/routes/admin");
const cookieParser = require("cookie-parser");
const movieListingRoutes = require("./src/routes/movie-listing");
const userRoutes = require("./src/routes/user");

app.use(express.urlencoded({ extended: true }));

connectToDb();
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

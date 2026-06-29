const express = require("express");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware/auth");

const {
  registerAdmin,
  loginAdmin,
  deleteAdmin,
  checkListedMovies,
  refreshAccessToken,
} = require("../controllers/admin-controller");

router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.delete("/delete", isLoggedIn, isAdmin, deleteAdmin);

router.get("/listed-movies", isLoggedIn, isAdmin, checkListedMovies);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out",
  });
});

module.exports = router;

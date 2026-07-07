const express = require("express");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registerAdminSchema,
  loginAdminSchema,
} = require("../validations/admin.validation");

const {
  registerAdmin,
  loginAdmin,
  deleteAdmin,
  getMyProfile,
  checkListedMovies,
  refreshAccessToken,
} = require("../controllers/admin-controller");

router.post("/register", validate(registerAdminSchema), registerAdmin);

router.post("/login", validate(loginAdminSchema), loginAdmin);

router.get("/auth-me", isLoggedIn, isAdmin, getMyProfile);

router.delete("/delete", isLoggedIn, isAdmin, deleteAdmin);

router.get("/listed-movies", isLoggedIn, isAdmin, checkListedMovies);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Logged out",
  });
});

module.exports = router;

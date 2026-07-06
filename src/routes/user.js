const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { isLoggedIn, isUser } = require("../middleware/auth");
const {
  registerUserSchema,
  loginUserSchema,
  bookingCancelParamsSchema,
} = require("../validations/user.validation");
const {
  registerUser,
  loginUser,
  deleteUser,
  checkMyBookings,
  cancelBooking,
  refreshAccessToken,
  authorize,
} = require("../controllers/user-controller");

router.post("/register", validate(registerUserSchema), registerUser);
router.post("/login", validate(loginUserSchema), loginUser);

router.get("/auth-me", isLoggedIn, isUser, authorize);

router.delete("/delete", isLoggedIn, deleteUser);
router.get("/my-bookings", isLoggedIn, isUser, checkMyBookings);
router.post(
  "/cancel-booking/:bookingId",
  validate(bookingCancelParamsSchema, "params"),
  isLoggedIn,
  isUser,
  cancelBooking,
);
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

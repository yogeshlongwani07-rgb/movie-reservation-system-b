const express = require("express");
const router = express.Router();
const { isLoggedIn, isUser } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  deleteUser,
  checkMyBookings,
  cancelBooking,
  refreshAccessToken,
} = require("../controllers/user-controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/delete", isLoggedIn, deleteUser);
router.get("/my-bookings", isLoggedIn, isUser, checkMyBookings);
router.post("/cancel-booking/:bookingId", isLoggedIn, isUser, cancelBooking);
router.post("/refresh-token", refreshAccessToken);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out",
  });
});

module.exports = router;

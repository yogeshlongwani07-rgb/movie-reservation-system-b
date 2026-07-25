const express = require("express");
const router = express.Router();
const { isLoggedIn, isUser } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { bookingIdParamsSchema } = require("../validations/payment-validation");
const { getPaymentByBooking } = require("../controllers/payment-controller");

router.get(
  "/booking/:bookingId",
  isLoggedIn,
  isUser,
  validate(bookingIdParamsSchema, "params"),
  getPaymentByBooking,
);

module.exports = router;

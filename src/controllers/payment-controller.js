const PaymentService = require("../services/payment-service");
const asyncHandler = require("../utils/asyncHandler");

const getPaymentByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const payment = await PaymentService.getPaymentByBookingId(bookingId);
  res.status(200).json({ success: true, payment });
});

module.exports = { getPaymentByBooking };

const PaymentService = require("../services/payment-service");
const asyncHandler = require("../utils/asyncHandler");

const getPaymentByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const payment = await PaymentService.getPaymentByBookingId(
    bookingId,
    req.user._id,
  );
  res.status(200).json({ success: true, message: "Payment fetched", payment });
});

module.exports = { getPaymentByBooking };

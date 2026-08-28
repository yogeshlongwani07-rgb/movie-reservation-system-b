const PaymentRepository = require("../repositories/payment-repository");
const AppError = require("../utils/appError");

class PaymentService {
  async recordSuccessfulPayment({
    bookingId,
    userId,
    userName,
    amount,
    adminId,
    currency,
    paymentMethod,
  }) {
    if (!bookingId || !userId || !userName || amount == null) {
      throw new AppError("Missing required payment details", 400);
    }

    const existing = await PaymentRepository.findByBookingId(
      bookingId.toString(),
    );
    if (existing) {
      return { id: existing.id, paymentUuid: existing.payment_uuid };
    }

    const payment = await PaymentRepository.createPayment({
      bookingId: bookingId.toString(),
      userId: userId.toString(),
      userNameSnapshot: userName,
      adminId: adminId ? adminId.toString() : null,
      amount,
      currency: currency || "INR",
      status: "SUCCESS",
      paymentMethod: paymentMethod || "NONE",
    });

    return payment;
  }

  async getPaymentByBookingId(bookingId, requesterUserId) {
    const payment = await PaymentRepository.findByBookingId(
      bookingId.toString(),
    );
    if (!payment) {
      throw new AppError("Payment not found for this booking", 404);
    }
    if (
      requesterUserId &&
      payment.user_id &&
      payment.user_id.toString() !== requesterUserId.toString()
    ) {
      throw new AppError("You are not authorized to view this payment", 403);
    }
    return payment;
  }
}

module.exports = new PaymentService();

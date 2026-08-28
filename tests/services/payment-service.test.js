jest.mock("../../src/repositories/payment-repository", () => ({
  findByBookingId: jest.fn(),
  createPayment: jest.fn(),
}));

const PaymentRepository = require("../../src/repositories/payment-repository");
const PaymentService = require("../../src/services/payment-service");

describe("PaymentService.getPaymentByBookingId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns payment when owner matches requester", async () => {
    PaymentRepository.findByBookingId.mockResolvedValue({
      booking_id: "booking-1",
      user_id: "user-1",
    });

    const payment = await PaymentService.getPaymentByBookingId(
      "booking-1",
      "user-1",
    );

    expect(payment.booking_id).toBe("booking-1");
  });

  test("throws forbidden for non-owner requester", async () => {
    PaymentRepository.findByBookingId.mockResolvedValue({
      booking_id: "booking-1",
      user_id: "user-1",
    });

    await expect(
      PaymentService.getPaymentByBookingId("booking-1", "user-2"),
    ).rejects.toThrow("You are not authorized to view this payment");
  });
});

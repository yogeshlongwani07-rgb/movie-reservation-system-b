const { randomUUID } = require("crypto");
const createMysqlPool = require("../config/mysql");

class PaymentRepository {
  async createPayment(data) {
    const pool = getMysqlPool();
    const paymentUuid = randomUUID();

    const [result] = pool.execute(
      `INSERT INTO payments
        (payment_uuid, booking_id, user_id, user_name_snapshot, admin_id, amount, currency, status, payment_method, refunded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        paymentUuid,
        data.bookingId,
        data.userId,
        data.userNameSnapshot,
        data.adminId || null,
        data.amount,
        data.currency || "INR",
        data.status || "INITIATED",
        data.paymentMethod || null,
        data.refundedAt || null,
      ],
    );
    return { id: result.insertId, paymentUuid };
  }
}

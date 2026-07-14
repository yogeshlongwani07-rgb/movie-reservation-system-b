const { randomUUID } = require("crypto");
const createMysqlPool = require("../config/mysql");

class PaymentRepository {
  async createPayment(data) {
    const pool = createMysqlPool();
    const paymentUuid = randomUUID();

    const [result] = await pool.execute(
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

  async findByBookingId(bookingId) {
    const pool = createMysqlPool();
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE booking_id = ? LIMIT 1`,
      [bookingId],
    );
    return rows[0] || null;
  }

  async updateStatusByBookingId(bookingId, status) {
    const pool = createMysqlPool();
    const [result] = await pool.execute(
      `UPDATE payments SET status = ? WHERE booking_id = ?`,
      [status, bookingId],
    );
    return result.affectedRows > 0;
  }
}

module.exports = new PaymentRepository();

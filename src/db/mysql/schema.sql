CREATE TABLE IF NOT EXISTS payments (
    id INT NOT NULL AUTO_INCREMENT,
    payment_uuid CHAR(36) NOT NULL,
    booking_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    user_name_snapshot VARCHAR(150) NOT NULL,
    admin_id VARCHAR(64) DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'INITIATED',
    payment_method VARCHAR(50) DEFAULT NULL,
    refunded_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payments_payment_uuid (payment_uuid),
    UNIQUE KEY uq_payments_booking_id (booking_id),
    KEY idx_payments_user_id (user_id),
    KEY idx_payments_status (status)
)
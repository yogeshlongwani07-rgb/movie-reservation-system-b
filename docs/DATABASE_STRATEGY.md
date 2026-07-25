# 🗄️ Database Strategy

This document records the database decisions for the project and serves as a reference while implementing future features.

## Guiding Principle

Choose the database based on the nature of the data rather than using a single database for everything.

### MongoDB

Use MongoDB for flexible, document-oriented data.

**Current & Planned Features**

* Users
* Movies
* Theatres
* Screens
* Shows
* Reviews & Ratings
* Wishlist
* Notifications
* Search Data
* QR Ticket Metadata
* Admin & Audit Logs

---

### SQL (PostgreSQL/MySQL)

Use a relational database for transactional and financial data that requires strong consistency and relationships.

**Current & Planned Features**

* Bookings
* Seat Reservations
* Seat Locking
* Payments
* Refunds
* Coupons
* Coupon Usage
* Loyalty Points
* Wallet (if implemented)
* Revenue & Financial Reports

---

### Redis

Use Redis for temporary, high-speed data.

**Planned Features**

* Seat Lock Expiration
* Caching
* Rate Limiting
* OTP Storage
* JWT Blacklist
* Background Jobs (BullMQ)
* Queue Processing

---

## Rules to Remember

* Flexible document → MongoDB
* Money or transactions → SQL
* Temporary or cached data → Redis
* Complex relationships → SQL
* Frequently changing document structure → MongoDB

---

## Future Goal

The long-term goal is to evolve the project from a MERN application into a production-ready system using the most appropriate database for each feature instead of relying on a single database for everything.

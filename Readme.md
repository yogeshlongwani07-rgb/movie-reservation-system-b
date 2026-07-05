# 🎬 Movie Reservation System API

> A scalable, secure, and transaction-safe Movie Reservation Backend built with **Node.js**, **Express.js**, and **MongoDB**.

![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 📖 Overview

Movie Reservation System is a **production-style REST API** that allows administrators to manage movies and users to reserve seats securely.

The project focuses on writing **clean backend architecture**, **transaction-safe booking logic**, **role-based authentication**, and **secure API development**.

Unlike basic CRUD projects, this backend is designed with scalability and maintainability in mind.

---

# ✨ Features

## 👨‍💼 Admin

- Register Admin
- Login & Logout
- JWT Authentication
- Refresh Token Support
- Create Movies
- Update Movies
- Delete Movies
- View Created Movies
- Delete Account

---

## 👤 User

- Register User
- Login & Logout
- JWT Authentication
- Refresh Token Support
- Browse Available Movies
- Book Seats
- Cancel Bookings
- View Booking History
- Delete Account

---

## ⚡ Booking System

- Multiple shows per movie
- Available seat tracking
- Seat reservation
- Booking cancellation
- Atomic booking operations using MongoDB Transactions
- Prevents inconsistent seat counts

---

## 🔒 Security

- JWT Authentication
- Refresh Tokens
- HTTP Only Cookies
- Password Hashing (bcrypt)
- Helmet Security Headers
- Rate Limiting
- Request Validation (Joi)
- Protected Routes
- Role-based Authorization

---

# 🏗 Architecture

The project follows a layered architecture.

```
            Request
               │
               ▼
            Routes
               │
               ▼
         Authentication
               │
               ▼
          Controllers
               │
               ▼
            Domain Layer
               │
               ▼
             Models
               │
               ▼
            MongoDB
```

Each layer has a single responsibility which keeps the project modular and easy to maintain.

---

# 📂 Project Structure

```
movie-reservation-system/

│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── domain/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── jobs/
│   ├── utils/
│   └── app.js
│
├── api.yaml
├── Dockerfile
├── DATABASE_STRATEGY.md
├── PLANNED_FEATURES.md
├── server.js
└── package.json
```

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Joi | Validation |
| Helmet | Security |
| Express Rate Limit | API Protection |
| Cookie Parser | Cookie Handling |
| Socket.io | Real-time Support |

---

# 🔑 Authentication Flow

```
User Login
     │
     ▼
Generate Access Token
     │
     ▼
Generate Refresh Token
     │
     ▼
Store Refresh Token
     │
     ▼
HTTP Only Cookie
     │
     ▼
Protected Routes
```

---

# 🎟 Booking Flow

```
Choose Movie
      │
      ▼
Select Show
      │
      ▼
Check Available Seats
      │
      ▼
Start MongoDB Transaction
      │
      ▼
Reserve Seat
      │
      ▼
Save Booking
      │
      ▼
Commit Transaction
```

If any step fails, the transaction rolls back automatically.

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/movie-reservation-system.git
```

Move into the project

```bash
cd movie-reservation-system
```

Install dependencies

```bash
npm install
```

---

# ⚙ Environment Variables

Create a `.env` file.

```env
PORT=3000

NODE_ENV=development

MONGO_URL=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_secret

REFRESH_TOKEN_SECRET=your_secret

SALT_ROUNDS=10

PASSKEY=your_admin_passkey
```

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 🧪 Running Tests

```bash
npm test
```

Watch Mode

```bash
npm run test:watch
```

Coverage

```bash
npm run coverage
```

---

# 📚 API Endpoints

## Admin

| Method | Endpoint |
|---------|----------|
| POST | /admin/register |
| POST | /admin/login |
| POST | /admin/logout |
| GET | /admin/movies |
| POST | /admin/movie |
| PATCH | /admin/movie/:id |
| DELETE | /admin/movie/:id |

---

## User

| Method | Endpoint |
|---------|----------|
| POST | /user/register |
| POST | /user/login |
| POST | /user/logout |
| GET | /user/movies |
| POST | /user/book |
| GET | /user/bookings |
| DELETE | /user/booking/:id |

---

# 📖 API Documentation

OpenAPI specification is included.

```
api.yaml
```

Import it into:

- Swagger UI
- Postman
- Insomnia

---

# 🐳 Docker

Build

```bash
docker build -t movie-api .
```

Run

```bash
docker run -p 3000:3000 movie-api
```

---

# 🚀 Highlights

- Clean Folder Structure
- Layered Architecture
- MongoDB Transactions
- JWT Authentication
- Refresh Tokens
- Role-Based Authorization
- HTTP Only Cookies
- Secure REST APIs
- Scalable Design
- Production-Oriented Backend

---

# 📈 Future Improvements

- Online Payment Integration
- Email Notifications
- QR Ticket Generation
- Seat Layout Visualization
- Redis Caching
- Movie Search
- Recommendation Engine
- Analytics Dashboard
- Real-time Seat Updates
- CI/CD Pipeline
- Kubernetes Deployment

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

It helps others discover the project and motivates further improvements.

---

# 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Yogesh**

Backend Developer • JavaScript • Node.js • Express.js • MongoDB

> Building scalable backend systems with clean architecture and secure APIs.

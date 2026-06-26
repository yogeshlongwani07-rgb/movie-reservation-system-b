# 🎬 Movie Booking & Reservation System API

> A secure RESTful backend for managing movie listings, show scheduling, and ticket reservations with role-based authentication using Node.js, Express, MongoDB, and JWT.

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Framework-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# 📖 Overview

The **Movie Booking & Reservation System API** is a backend application designed to manage movie listings and customer bookings.

The system provides two different roles:

- **Admin** – Manage movie listings and monitor created movies.
- **User** – Browse movies, book tickets, manage bookings, and cancel reservations.

The application uses **JWT Authentication**, **Role-Based Authorization**, **MongoDB**, and **Express.js** to provide a secure booking platform.

---

# ✨ Features

## 👨‍💼 Admin

- Register Admin
- Login Admin
- Logout
- Create Movie Listings
- Update Movie Listings
- Delete Movie Listings
- View All Movies Created by Admin
- Delete Admin Account

---

## 👤 User

- Register User
- Login User
- Logout
- View Available Movies
- View Available Shows
- Book Movie Tickets
- Cancel Booking
- View Booking History
- Delete User Account

---

## 🔐 Security

- JWT Authentication
- HTTP Only Cookies
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization
- Input Validation
- Secure Environment Variables

---

# 🛠 Tech Stack

| Technology    | Purpose               |
| ------------- | --------------------- |
| Node.js       | Runtime Environment   |
| Express.js    | Backend Framework     |
| MongoDB       | Database              |
| Mongoose      | ODM                   |
| JWT           | Authentication        |
| bcrypt        | Password Encryption   |
| Validator     | Input Validation      |
| Cookie Parser | Cookie Handling       |
| dotenv        | Environment Variables |

---

# 📂 Project Structure

```
booking-reservation-system/
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── DB/
│
├── app.js
├── package.json
└── .env
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/booking-reservation-system.git
```

Move into project

```bash
cd booking-reservation-system
```

Install dependencies

```bash
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000

MONGO_URL=mongodb://127.0.0.1:27017/cinema

SECRET_JWT=your_super_secret_key

SALT_ROUNDS=10

NODE_ENV=development
```

---

# ▶️ Running the Server

Development

```bash
node app.js
```

When the server starts successfully:

```
Database connected successfully
Server Running
```

---

# 📡 API Endpoints

## Admin Routes

| Method | Endpoint               | Description       |
| ------ | ---------------------- | ----------------- |
| POST   | `/admin/register`      | Register Admin    |
| POST   | `/admin/login`         | Login Admin       |
| POST   | `/admin/logout`        | Logout Admin      |
| DELETE | `/admin/delete`        | Delete Admin      |
| GET    | `/admin/listed-movies` | View Admin Movies |

---

## Movie Routes

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| GET    | `/movie/`                      | Get All Movies      |
| POST   | `/movie/add`                   | Add Movie           |
| PUT    | `/movie/edit/:id`              | Update Movie        |
| DELETE | `/movie/delete/:id`            | Delete Movie        |
| GET    | `/movie/shows?date=YYYY-MM-DD` | Available Shows     |
| POST   | `/movie/bookings`              | Book Tickets        |
| GET    | `/movie/owner/:id`             | Movie Owner Details |

---

## User Routes

| Method | Endpoint                          | Description    |
| ------ | --------------------------------- | -------------- |
| POST   | `/user/register`                  | Register User  |
| POST   | `/user/login`                     | Login User     |
| POST   | `/user/logout`                    | Logout User    |
| DELETE | `/user/delete`                    | Delete User    |
| GET    | `/user/my-bookings`               | View Bookings  |
| POST   | `/user/cancel-booking/:bookingId` | Cancel Booking |

---

# 🔑 Authentication

After successful login, the server stores a **JWT Token** inside an **HTTP Only Cookie**.

Protected endpoints require authentication.

Authorization is handled using middleware:

- `isLoggedIn`
- `isAdmin`
- `isUser`

---

# 📦 Main Dependencies

```json
{
  "express": "^5.x",
  "mongoose": "^9.x",
  "jsonwebtoken": "^9.x",
  "bcrypt": "^6.x",
  "cookie-parser": "^1.x",
  "validator": "^13.x",
  "dotenv": "^17.x"
}
```

---

# 📌 Booking Workflow

```
User Registration
        │
        ▼
User Login
        │
        ▼
Browse Movies
        │
        ▼
View Available Shows
        │
        ▼
Book Seats
        │
        ▼
Seats Updated in Database
        │
        ▼
Booking Stored in User Profile
```

---

# 🔄 Admin Workflow

```
Admin Login
      │
      ▼
Create Movie Listing
      │
      ▼
Manage Shows
      │
      ▼
Update/Delete Movies
      │
      ▼
View Listed Movies
```

---

# 📈 Future Improvements

- Payment Gateway Integration
- Email Notifications
- Booking QR Codes
- Movie Posters Upload
- Search & Filter Movies
- Pagination
- Docker Support
- Unit Testing
- CI/CD Pipeline
- Real-time Seat Updates (Socket.IO)

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

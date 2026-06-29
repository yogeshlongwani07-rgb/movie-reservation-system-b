# 🎬 Movie Reservation System API

A backend-only REST API for managing movie listings, show schedules, user accounts, and seat bookings with **JWT authentication**, **role-based authorization**, and **MongoDB transactions**.

> This repository focuses on backend API development. Any frontend, mobile app, or admin panel can consume these endpoints.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Data Models](#data-models)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Authentication](#api-authentication)
- [API Endpoints](#api-endpoints)
- [Booking Flow](#booking-flow)
- [Pagination](#pagination)
- [Security](#security)
- [OpenAPI Documentation](#openapi-documentation)
- [Docker](#docker)
- [Project Notes](#project-notes)

---

## Overview

The **Movie Reservation System API** is built with Node.js, Express, and MongoDB.

It provides two main roles:

- **Admin**: registers, logs in, creates movie listings, updates listings, deletes listings, and views movies created by that admin.
- **User**: registers, logs in, views available shows, books seats, views bookings, and cancels bookings.

The project uses:

- **HTTP-only cookies** for token storage
- **bcrypt** for password hashing
- **JWT** for access and refresh tokens
- **MongoDB transactions** for booking and deletion workflows
- **Mongoose** for schema modeling and database operations

---

## Key Features

### Admin Features

- Register admin account
- Login admin account
- Delete admin account
- Create movie listings
- Update movie listings
- Delete movie listings
- View movies created by the admin
- Refresh access token

### User Features

- Register user account
- Login user account
- Delete user account
- View available shows by date
- Book movie seats
- View booking history
- Cancel bookings
- Refresh access token

### Backend Features

- Role-based authorization
- Password hashing
- Protected routes
- Transaction-based seat booking
- Transaction-based movie deletion
- Input validation
- Global 404 handling
- Cookie-based auth flow

---

## Tech Stack

| Technology         | Purpose          |
| ------------------ | ---------------- |
| Node.js            | Runtime          |
| Express.js         | Web framework    |
| MongoDB            | Database         |
| Mongoose           | ODM              |
| JWT                | Authentication   |
| bcrypt             | Password hashing |
| cookie-parser      | Cookie support   |
| helmet             | Security headers |
| express-rate-limit | Rate limiting    |
| validator          | Input validation |

---

## Architecture

The codebase follows a clean backend flow:

```text
Route → Controller → Domain → Model → MongoDB
```

### Responsibilities

- **Routes**: define endpoints and middleware
- **Controllers**: receive requests and send responses
- **Domain layer**: contains business logic
- **Models**: define MongoDB schemas
- **Middleware**: handles authentication and authorization
- **Utils**: shared helpers such as token generation and custom errors

---

## Folder Structure

```text
movie-reservation-system-main/
├── app.js
├── api.yaml
├── Dockerfile
├── DATABASE_STRATEGY.md
├── PLANNED_FEATURES.md
├── src/
│   ├── config/
│   │   └── connect.js
│   ├── controllers/
│   │   ├── admin-controller.js
│   │   ├── movie-controller.js
│   │   └── user-controller.js
│   ├── domain/
│   │   ├── admin-domain.js
│   │   ├── movie-domain.js
│   │   └── user-domain.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── admin.js
│   │   ├── movie.js
│   │   └── user.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── movie-listing.js
│   │   └── user.js
│   └── utils/
│       ├── appError.js
│       └── generateToken.js
```

---

## Data Models

### Admin

Fields:

- `name`
- `email`
- `password`
- `role`
- `refreshToken`
- `movies[]`

### User

Fields:

- `name`
- `email`
- `password`
- `role`
- `refreshToken`
- `bookings[]`

### Movie

Fields:

- `title`
- `description`
- `language`
- `duration`
- `rating`
- `price`
- `createdBy`
- `shows[]`

### Show Object

Each movie can contain multiple show entries with:

- `showTime`
- `date`
- `totalSeats`
- `availableSeats`
- `screen`

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
NODE_ENV=development
MONGO_URL=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SALT_ROUNDS=10
PASSKEY=your_admin_creation_passkey
```

### Variable Purpose

- **MONGO_URL**: MongoDB connection string
- **ACCESS_TOKEN_SECRET**: secret used to sign access tokens
- **REFRESH_TOKEN_SECRET**: secret used to sign refresh tokens
- **SALT_ROUNDS**: bcrypt salt rounds for password hashing
- **PASSKEY**: required for creating admin accounts
- **NODE_ENV**: enables production security behavior when set to `production`

---

## Installation

```bash
git clone <your-repo-url>
cd movie-reservation-system-main
npm install
```

---

## Running the Project

### Development mode

```bash
node app.js
```

### With nodemon

```bash
npx nodemon app.js
```

### With Docker

See the [Docker](#docker) section.

---

## API Authentication

The API uses **JWT tokens stored in HTTP-only cookies**.

### Token flow

1. User/Admin logs in or registers.
2. Server returns:
   - `accessToken`
   - `refreshToken`
3. Tokens are stored in cookies.
4. Protected routes read `accessToken` from cookies.
5. When access token expires, client can call the refresh endpoint.

### Protected routes

A request must include cookies for authenticated endpoints such as:

- create movie
- update movie
- delete movie
- view bookings
- cancel booking

### Authorization rules

- **Admin-only** routes: movie creation, movie update, movie delete, admin delete, listed movies
- **User-only** routes: booking, cancel booking, booking history
- **Logged-in** routes: delete account, refresh token, etc.

---

## API Endpoints

The current route prefixes are:

- `/admin`
- `/user`
- `/movie`

---

### Health Check

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| GET    | `/`      | Service status check |

Response:

```json
{ "message": "All Set" }
```

---

### Admin Routes

| Method | Endpoint               | Auth              | Description                                |
| ------ | ---------------------- | ----------------- | ------------------------------------------ |
| POST   | `/admin/register`      | Public            | Register a new admin                       |
| POST   | `/admin/login`         | Public            | Login admin                                |
| DELETE | `/admin/delete`        | Logged in + Admin | Delete admin account and associated movies |
| GET    | `/admin/listed-movies` | Logged in + Admin | Get movies created by the admin            |
| POST   | `/admin/refresh-token` | Public            | Refresh access token                       |
| POST   | `/admin/logout`        | Public            | Logout admin                               |

#### Admin register example

```bash
POST /admin/register
```

```json
{
  "name": "Admin One",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "admin",
  "passkey": "your_admin_passkey"
}
```

---

### User Routes

| Method | Endpoint                          | Auth             | Description          |
| ------ | --------------------------------- | ---------------- | -------------------- |
| POST   | `/user/register`                  | Public           | Register a new user  |
| POST   | `/user/login`                     | Public           | Login user           |
| DELETE | `/user/delete`                    | Logged in        | Delete user account  |
| GET    | `/user/my-bookings`               | Logged in + User | View booking history |
| POST   | `/user/cancel-booking/:bookingId` | Logged in + User | Cancel a booking     |
| POST   | `/user/refresh-token`             | Public           | Refresh access token |
| POST   | `/user/logout`                    | Public           | Logout user          |

#### User register example

```bash
POST /user/register
```

```json
{
  "name": "Yogesh",
  "email": "yogesh@example.com",
  "password": "secret123"
}
```

---

### Movie Routes

| Method | Endpoint                                 | Auth              | Description                    |
| ------ | ---------------------------------------- | ----------------- | ------------------------------ |
| GET    | `/movie`                                 | Public            | Get all movies with pagination |
| POST   | `/movie/create`                          | Logged in + Admin | Create a new movie listing     |
| PUT    | `/movie/update/:id`                      | Logged in + Admin | Update a movie listing         |
| DELETE | `/movie/delete/:id`                      | Logged in + Admin | Delete a movie listing         |
| GET    | `/movie/available-shows?date=YYYY-MM-DD` | Logged in         | Get available shows for a date |
| POST   | `/movie/book-show`                       | Logged in + User  | Book seats for a show          |

#### Create movie example

```bash
POST /movie/create
```

```json
{
  "title": "Inception",
  "description": "A mind-bending thriller",
  "language": "English",
  "duration": 148,
  "rating": 8.8,
  "price": 250,
  "shows": [
    {
      "showTime": "18:30",
      "date": "2026-06-30",
      "totalSeats": 100,
      "availableSeats": 100,
      "screen": "Screen 1"
    }
  ]
}
```

#### Book show example

```bash
POST /movie/book-show
```

```json
{
  "movieId": "movie_object_id",
  "showId": "show_object_id",
  "seats": 2
}
```

---

## Booking Flow

The booking flow is designed to avoid inconsistent seat counts.

### Booking steps

1. Validate `movieId`, `showId`, and seat count.
2. Fetch the movie inside a MongoDB transaction.
3. Find the specific show.
4. Check seat availability.
5. Push the booking into the user document.
6. Reduce `availableSeats` in the show.
7. Save both documents within the same transaction.

### Cancellation steps

1. Find the booking under the user profile.
2. Mark the booking as `Cancelled`.
3. Restore seats to the related show.
4. Save user and movie changes in a transaction.

### Why this matters

This helps prevent:

- double booking
- seat count mismatches
- partial updates when one write succeeds and another fails

---

## Pagination

The movie listing endpoint supports pagination through query parameters.

### Example

```bash
GET /movie?page=1&limit=5
GET /movie?page=2&limit=10
```

### Behavior

- `page` defaults to `1`
- `limit` defaults to `5`
- `skip = (page - 1) * limit`

### Example response shape

```json
[
  {
    "_id": "..."
  }
]
```

### Notes

Pagination is currently implemented for the movie listing route only.

---

## Security

This project includes several backend security practices:

- **bcrypt** for password hashing
- **JWT** access and refresh tokens
- **HTTP-only cookies** to reduce token exposure
- **Role checks** for admin/user access control
- **Helmet** for security headers in production
- **Rate limiting** in production
- **Input validation** for email and password checks
- **Mongoose transactions** for critical operations

---

## OpenAPI Documentation

An **OpenAPI 3.0** specification is included in:

```text
api.yaml
```

This can be used to:

- document the API
- import into Swagger UI
- generate client collections
- share endpoint contracts with teammates

---

## Docker

The repository includes a Dockerfile.

### Build image

```bash
docker build -t movie-reservation-api .
```

### Run container

```bash
docker run -p 3000:3000 --env-file .env movie-reservation-api
```

---

## Project Notes

### Good parts of the implementation

- Clear separation between routes, controllers, domain logic, and models
- JWT-based authentication
- Refresh token support
- Transaction-based booking and deletion
- Role-based protection for sensitive routes
- OpenAPI spec already present in the repo

### Things to keep in mind

- This is a backend API project, so there is no frontend in this repository
- Route prefixes are currently unversioned
- The API is best tested with Postman, Swagger UI, or any frontend/mobile client
- The logout route is available and can be wired to client-side cookie clearing as needed

---

## License

This project can be used for learning and interview preparation. Add a license here if you want to publish it publicly.

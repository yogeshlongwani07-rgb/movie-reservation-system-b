# Movie Reservation System API

A backend API for managing movie listings, show schedules, seat holds, bookings, authentication, and admin/user workflows.

## Stack

- Node.js
- Express.js
- MongoDB
- MySQL
- Redis
- JWT authentication
- Socket.io
- Cloudinary uploads
- Google OAuth

## What this repository contains

```text
movie-reservation-system-b-main/
├── api.yaml
├── Dockerfile
├── docker-compose.yaml
├── docs/
├── server.js
├── src/
├── tests/
├── package.json
└── Readme.md
```

## Features

### Admin

- Register and login
- Authenticated profile access
- Refresh token and logout flows
- Create, update, delete movies
- View created movies

### User

- Register and login
- Google OAuth login
- Authenticated profile access
- Refresh token and logout flows
- Browse movies and shows
- Hold seats, book seats, and cancel bookings
- View booking history

### Platform

- HTTP-only cookie auth
- Protected routes
- Role-based access control
- Seat locking / booking flow
- Redis-backed temporary hold support
- Transaction-safe reservation flow
- Validation and security middleware

## Prerequisites

- Node.js 22+
- MongoDB
- MySQL 8+
- Redis 7+
- npm

## Environment setup

Create a local environment file from the example:

```bash
cp .env.example .env
```

Set the values that are required by the application, especially:

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `PASSKEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`
- database connection variables for MongoDB, MySQL, and Redis

## Run locally

```bash
npm install
npm run dev
```

The server starts on the port defined in `PORT` or `3000` by default.

## Run with Docker

For the bundled compose setup, the app container expects the supporting services to be available as:

- MongoDB: `mongo`
- MySQL: `mysql`
- Redis: `redis`

The compose file already sets sensible defaults for those service names.

```bash
docker compose up --build
```

If you are using a `.env` file for Docker, make sure the runtime values match the container service names instead of `localhost`.

## API documentation

The OpenAPI specification is in `api.yaml`.

Main route groups:

- `/` health check
- `/api/v1/auth/*` Google OAuth
- `/api/v1/admin/*` admin auth and movie management
- `/api/v1/user/*` user auth and booking history
- `/api/v1/movie/*` movie, show, hold, and booking routes

## Reference docs

- `docs/DATABASE_STRATEGY.md`
- `docs/PLANNED_FEATURES.md`
- `docs/REDIS-ACTION.md`

## Notes

- Authentication uses HTTP-only cookies named `accessToken` and `refreshToken`.
- The repository uses CommonJS modules.
- The Docker image is built for production use.

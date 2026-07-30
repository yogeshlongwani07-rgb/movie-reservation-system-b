const BOOKING_STATUS = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  HOLD: "Hold",
  EXPIRED: "Expired",
};

const SEAT_TYPES = {
  STANDARD: "Standard",
  PREMIUM: "Premium",
  RECLINERS: "Recliners",
  COUPLE: "Couple",
  WHEELCHAIR: "Wheelchair",
};

const SEAT_STATUS = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  LOCKED: "Locked",
};

const SEAT_PRICING = {
  [SEAT_TYPES.STANDARD]: 1.0,
  [SEAT_TYPES.PREMIUM]: 1.5,
  [SEAT_TYPES.RECLINERS]: 2.0,
  [SEAT_TYPES.COUPLE]: 1.8,
  [SEAT_TYPES.WHEELCHAIR]: 1.0,
};

const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 1000;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const requiredEnvVars = [
  "MONGO_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "SALT_ROUNDS",
  "PASSKEY",
  "FRONTEND_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "CLOUD_NAME",
  "CLOUD_API_KEY",
  "CLOUD_API_SECRET",
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
  "MYSQL_SSL_CA_PATH",
  "MYSQL_SSL",
  "REDIS_URL",
];

const corsOptions =
  process.env.NODE_ENV === "production"
    ? {
        origin: process.env.ALLOWED_ORIGINS?.split(",") || frontendUrl,
        credentials: true,
      }
    : { origin: frontendUrl, credentials: true };

module.exports = {
  BOOKING_STATUS,
  SEAT_TYPES,
  SEAT_STATUS,
  SEAT_PRICING,
  DEFAULT_CLEANUP_INTERVAL_MS,
  FIFTEEN_MINUTES_MS,
  SEVEN_DAYS_MS,
  corsOptions,
  requiredEnvVars,
};

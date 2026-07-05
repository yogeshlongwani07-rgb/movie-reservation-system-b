const Movie = require("../models/movie");
const User = require("../models/user");
const { BOOKING_STATUS } = require("../Constants");
const { releaseExpiredLocks } = require("../utils/releaseExpiredLocks");
const { DEFAULT_CLEANUP_INTERVAL_MS } = require("../Constants");

async function cleanupExpiredHolds() {
  const now = new Date();
  const movies = await Movie.find({
    "shows.seats.lockedExpires": { $lte: now },
  });

  for (const movie of movies) {
    let hasReleasedLocks = false;

    for (const show of movie.shows) {
      const releasedCount = await releaseExpiredLocks(show, now);
      if (releasedCount > 0) {
        hasReleasedLocks = true;
      }
    }

    if (hasReleasedLocks) {
      await movie.save();
    }
  }

  await User.updateMany(
    {
      "bookings.status": BOOKING_STATUS.HOLD,
      "bookings.holdExpiresAt": { $lte: now },
    },
    {
      $set: {
        "bookings.$[booking].status": BOOKING_STATUS.EXPIRED,
      },
    },
    {
      arrayFilters: [
        {
          "booking.status": BOOKING_STATUS.HOLD,
          "booking.holdExpiresAt": { $lte: now },
        },
      ],
    },
  );
}

function startLockCleanupJob(intervalMs = DEFAULT_CLEANUP_INTERVAL_MS) {
  const interval = setInterval(() => {
    cleanupExpiredHolds().catch((err) => {
      console.error("Failed to clean up expired seat holds", err);
    });
  }, intervalMs);

  if (typeof interval.unref === "function") {
    interval.unref();
  }

  return interval;
}

module.exports = { cleanupExpiredHolds, startLockCleanupJob };

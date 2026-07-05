const { SEAT_STATUS } = require("../Constants");

async function releaseExpiredLocks(show) {
  const now = new Date();

  for (const seat of show.seats) {
    if (
      seat.status === SEAT_STATUS.LOCKED &&
      seat.lockedExpires &&
      seat.lockedExpires < now
    ) {
      seat.status = SEAT_STATUS.AVAILABLE;
      seat.lockedBy = null;
      seat.lockedExpires = null;

      show.availableSeats++;
      show.lockedSeats--;
    }
  }
}

module.exports = { releaseExpiredLocks };

const { SEAT_STATUS } = require("../Constants");

async function releaseExpiredLocks(show, now = new Date()) {
  let releasedCount = 0;

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
      releasedCount++;
    }
  }
  return releasedCount;
}

module.exports = { releaseExpiredLocks };

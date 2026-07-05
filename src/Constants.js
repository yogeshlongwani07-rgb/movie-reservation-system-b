const BOOKING_STATUS = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  HOLD: "Hold",
  Expired: "Expired",
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

module.exports = { BOOKING_STATUS, SEAT_TYPES, SEAT_STATUS, SEAT_PRICING };

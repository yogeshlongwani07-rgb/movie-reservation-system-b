const { SEAT_TYPES, SEAT_STATUS, SEAT_PRICING } = require("../Constants");

function getRowLetters(count) {
  let letters = [];
  for (let i = 0; i < count; i++) {
    letters.push(String.fromCharCode(65 + i));
  }
  return letters;
}

function getPriceMultiplier(type) {
  return SEAT_PRICING[type];
}

function generateSeats(rows, columns) {
  let seats = [];
  let rowLetters = getRowLetters(rows);
  //i = row
  //j = col
  for (let i = 0; i < rows; i++) {
    const row = rowLetters[i];

    for (let j = 1; j <= columns; j++) {
      const determineSeat = determineSeatType(i, j, rows, columns);
      seats.push({
        seatNumber: `${row}${j}`,
        row: row,
        column: j,
        seatType: determineSeat,
        status: SEAT_STATUS.AVAILABLE,
        priceMultiplier: getPriceMultiplier(determineSeat),
      });
    }
  }
  return seats;
}
function determineSeatType(rowIdx, col, totalRows, totalCols) {
  // Wheelchair seats
  if (col === 1 || col === totalCols) {
    return SEAT_TYPES.WHEELCHAIR;
  }

  // Couple seats
  const middleRows = Math.floor(totalRows / 2);

  if (
    rowIdx >= middleRows - 1 &&
    rowIdx <= middleRows + 1 &&
    (col === 8 || col === 9)
  ) {
    return SEAT_TYPES.COUPLE;
  }

  // Premium seats
  if (
    rowIdx >= Math.floor(totalRows / 3) &&
    rowIdx <= Math.floor((2 * totalRows) / 3) &&
    col >= Math.floor(totalCols / 3) &&
    col <= Math.floor((2 * totalCols) / 3)
  ) {
    return SEAT_TYPES.PREMIUM;
  }

  // Recliners
  if (
    rowIdx >= Math.floor((2 * totalRows) / 3) &&
    col >= Math.floor(totalCols / 4) &&
    col <= Math.floor((3 * totalCols) / 4)
  ) {
    return SEAT_TYPES.RECLINERS;
  }

  return SEAT_TYPES.STANDARD;
}

function getSeatByNumber(show, seatNumber) {
  return show.seats.find((seat) => seat.seatNumber === seatNumber);
}

function getSeatsByNumbers(show, seatNumbers) {
  return seatNumbers.map((seatNumber) => getSeatByNumber(show, seatNumber)).filter(Boolean);
}

module.exports = {
  generateSeats,
  determineSeatType,
  getPriceMultiplier,
  getRowLetters,
  getSeatByNumber,
  getSeatsByNumbers,
};

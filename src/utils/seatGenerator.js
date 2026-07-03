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

// function getSeatByNumber(show, seatNumber) {
//   return show.seats.find((seat) => seat.seatNumber === seatNumber);
// }

// function getSeatsByNumbers(show, seatNumbers) {
//   return seatNumbers
//     .map((seatNumber) => getSeatByNumber(show, seatNumber))
//     .filter(Boolean);
// }

module.exports = {
  generateSeats,
  determineSeatType,
  getPriceMultiplier,
  getRowLetters,
  //   getSeatByNumber,
  //   getSeatsByNumbers,
};

// const { SEAT_TYPES, SEAT_STATUS } = require("../constants/seatTypes");

// class SeatGenerator {
//   /**
//    * Generate seats based on layout and seat type distribution
//    * @param {number} rows - Number of rows (10 = A-J)
//    * @param {number} columns - Number of columns (15 = 1-15)
//    * @param {Object} seatDistribution - How to distribute seat types
//    * @returns {Array} Array of seat objects
//    */
//   static generateSeats(rows, columns, seatDistribution = {}) {
//     const seats = [];
//     const rowLetters = this.getRowLetters(rows);

//     // Default distribution
//     const distribution = {
//       [SEAT_TYPES.STANDARD]: 0.6,    // 60% standard
//       [SEAT_TYPES.PREMIUM]: 0.25,    // 25% premium
//       [SEAT_TYPES.RECLINERS]: 0.1,   // 10% recliners
//       [SEAT_TYPES.COUPLE]: 0.04,     // 4% couple seats
//       [SEAT_TYPES.WHEELCHAIR]: 0.01, // 1% wheelchair
//       ...seatDistribution,
//     };

//     let seatIndex = 0;

//     for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
//       const row = rowLetters[rowIdx];

//       for (let col = 1; col <= columns; col++) {
//         const seatType = this.determineSeatType(
//           rowIdx,
//           col,
//           rows,
//           columns,
//           distribution
//         );

//         const seat = {
//           seatNumber: `${row}${col}`,
//           row: row,
//           column: col,
//           seatType: seatType,
//           status: SEAT_STATUS.AVAILABLE,
//           priceMultiplier: this.getPriceMultiplier(seatType),
//         };

//         seats.push(seat);
//         seatIndex++;
//       }
//     }

//     return seats;
//   }

//   /**
//    * Determine seat type based on position
//    * Premium seats are in middle rows and middle columns
//    * Couple seats are marked specially
//    * Wheelchair seats are at ends
//    */
//   static determineSeatType(rowIdx, col, totalRows, totalCols, distribution) {
//     // Wheelchair seats: first and last columns
//     if (col === 1 || col === totalCols) {
//       return SEAT_TYPES.WHEELCHAIR;
//     }

//     // Couple seats: specific positions (e.g., seats 8 & 9 in middle rows)
//     const middleRows = Math.floor(totalRows / 2);
//     if (
//       (rowIdx >= middleRows - 1 && rowIdx <= middleRows + 1) &&
//       (col === 8 || col === 9)
//     ) {
//       return SEAT_TYPES.COUPLE;
//     }

//     // Premium seats: middle rows and middle columns
//     if (
//       rowIdx >= Math.floor(totalRows / 3) &&
//       rowIdx <= Math.floor((2 * totalRows) / 3) &&
//       col >= Math.floor(totalCols / 3) &&
//       col <= Math.floor((2 * totalCols) / 3)
//     ) {
//       return SEAT_TYPES.PREMIUM;
//     }

//     // Recliners: back middle section
//     if (
//       rowIdx >= Math.floor((2 * totalRows) / 3) &&
//       col >= Math.floor(totalCols / 4) &&
//       col <= Math.floor((3 * totalCols) / 4)
//     ) {
//       return SEAT_TYPES.RECLINERS;
//     }

//     // Default to standard
//     return SEAT_TYPES.STANDARD;
//   }

//   /**
//    * Get price multiplier for seat type
//    */
//   static getPriceMultiplier(seatType) {
//     const { SEAT_PRICING } = require("../constants/seatTypes");
//     return SEAT_PRICING[seatType] || 1.0;
//   }

//   /**
//    * Convert row index to letter (0 = A, 1 = B, etc.)
//    */
//   static getRowLetters(count) {
//     const letters = [];
//     for (let i = 0; i < count; i++) {
//       letters.push(String.fromCharCode(65 + i)); // 65 = 'A'
//     }
//     return letters;
//   }

//   /**
//    * Get seat by seat number from show
//    */
//   static getSeatByNumber(show, seatNumber) {
//     return show.seats.find((s) => s.seatNumber === seatNumber);
//   }

//   /**
//    * Get multiple seats by seat numbers
//    */
//   static getSeatsByNumbers(show, seatNumbers) {
//     return seatNumbers
//       .map((num) => this.getSeatByNumber(show, num))
//       .filter((seat) => seat !== undefined);
//   }
// }

// module.exports = SeatGenerator;

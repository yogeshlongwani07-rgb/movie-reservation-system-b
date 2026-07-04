const {
  generateSeats,
  determineSeatType,
  getPriceMultiplier,
  getRowLetters,
  getSeatByNumber,
  getSeatsByNumbers,
} = require("../../src/utils/seatGenerator");
const {
  SEAT_TYPES,
  SEAT_STATUS,
  SEAT_PRICING,
} = require("../../src/Constants");

describe("seatGenerator utility", () => {
  describe("getRowLetters", () => {
    test("returns sequential uppercase letters", () => {
      expect(getRowLetters(5)).toEqual(["A", "B", "C", "D", "E"]);
    });

    test("returns an empty array for zero rows", () => {
      expect(getRowLetters(0)).toEqual([]);
    });
  });

  describe("getPriceMultiplier", () => {
    test.each([
      [SEAT_TYPES.STANDARD, SEAT_PRICING[SEAT_TYPES.STANDARD]],
      [SEAT_TYPES.PREMIUM, SEAT_PRICING[SEAT_TYPES.PREMIUM]],
      [SEAT_TYPES.RECLINERS, SEAT_PRICING[SEAT_TYPES.RECLINERS]],
      [SEAT_TYPES.COUPLE, SEAT_PRICING[SEAT_TYPES.COUPLE]],
      [SEAT_TYPES.WHEELCHAIR, SEAT_PRICING[SEAT_TYPES.WHEELCHAIR]],
    ])("returns the multiplier for %s", (seatType, expected) => {
      expect(getPriceMultiplier(seatType)).toBe(expected);
    });

    test("returns undefined for an unknown seat type", () => {
      expect(getPriceMultiplier("Unknown Type")).toBeUndefined();
    });
  });

  describe("determineSeatType", () => {
    test.each([
      [0, 1, 9, 12, SEAT_TYPES.WHEELCHAIR, "first column is wheelchair"],
      [4, 12, 9, 12, SEAT_TYPES.WHEELCHAIR, "last column is wheelchair"],
      [4, 8, 9, 12, SEAT_TYPES.COUPLE, "middle rows and seat 8 is couple"],
      [4, 9, 9, 12, SEAT_TYPES.COUPLE, "middle rows and seat 9 is couple"],
      [4, 5, 9, 12, SEAT_TYPES.PREMIUM, "middle third becomes premium"],
      [7, 5, 9, 12, SEAT_TYPES.RECLINERS, "lower third becomes recliners"],
      [0, 5, 9, 12, SEAT_TYPES.STANDARD, "outer rows become standard"],
    ])(
      "returns %s when %s",
      (rowIdx, col, totalRows, totalCols, expected, label) => {
        expect(determineSeatType(rowIdx, col, totalRows, totalCols)).toBe(
          expected,
        );
      },
    );

    test("wheelchair seats take priority over other seat rules", () => {
      expect(determineSeatType(4, 1, 9, 12)).toBe(SEAT_TYPES.WHEELCHAIR);
    });

    test("couple seats take priority over premium seats when they overlap", () => {
      expect(determineSeatType(4, 8, 9, 12)).toBe(SEAT_TYPES.COUPLE);
    });
  });

  describe("generateSeats", () => {
    test("generates the full seat map with numbering, type, status, and pricing", () => {
      const seats = generateSeats(3, 4);

      expect(seats).toHaveLength(12);
      expect(seats[0]).toEqual({
        seatNumber: "A1",
        row: "A",
        column: 1,
        seatType: SEAT_TYPES.WHEELCHAIR,
        status: SEAT_STATUS.AVAILABLE,
        priceMultiplier: SEAT_PRICING[SEAT_TYPES.WHEELCHAIR],
      });
      expect(seats[1]).toEqual({
        seatNumber: "A2",
        row: "A",
        column: 2,
        seatType: SEAT_TYPES.STANDARD,
        status: SEAT_STATUS.AVAILABLE,
        priceMultiplier: SEAT_PRICING[SEAT_TYPES.STANDARD],
      });
      expect(seats[3]).toEqual({
        seatNumber: "A4",
        row: "A",
        column: 4,
        seatType: SEAT_TYPES.WHEELCHAIR,
        status: SEAT_STATUS.AVAILABLE,
        priceMultiplier: SEAT_PRICING[SEAT_TYPES.WHEELCHAIR],
      });
    });

    test("applies couple, premium, and recliner rules in larger layouts", () => {
      const seats = generateSeats(9, 12);
      const lookup = (seatNumber) =>
        seats.find((seat) => seat.seatNumber === seatNumber);

      expect(lookup("D8").seatType).toBe(SEAT_TYPES.COUPLE);
      expect(lookup("D9").seatType).toBe(SEAT_TYPES.COUPLE);
      expect(lookup("D5").seatType).toBe(SEAT_TYPES.PREMIUM);
      expect(lookup("G5").seatType).toBe(SEAT_TYPES.PREMIUM);
      expect(lookup("A5").seatType).toBe(SEAT_TYPES.STANDARD);
    });
  });

  describe("getSeatByNumber", () => {
    const show = {
      seats: [
        { seatNumber: "A1", seatType: SEAT_TYPES.WHEELCHAIR },
        { seatNumber: "A2", seatType: SEAT_TYPES.STANDARD },
      ],
    };

    test("returns the matching seat", () => {
      expect(getSeatByNumber(show, "A2")).toEqual({
        seatNumber: "A2",
        seatType: SEAT_TYPES.STANDARD,
      });
    });

    test("returns undefined for a missing seat", () => {
      expect(getSeatByNumber(show, "B1")).toBeUndefined();
    });
  });

  describe("getSeatsByNumbers", () => {
    const show = {
      seats: [
        { seatNumber: "A1", seatType: SEAT_TYPES.WHEELCHAIR },
        { seatNumber: "A2", seatType: SEAT_TYPES.STANDARD },
        { seatNumber: "A3", seatType: SEAT_TYPES.PREMIUM },
      ],
    };

    test("returns only seats that exist in the same order as requested", () => {
      expect(getSeatsByNumbers(show, ["A3", "A1", "B9", "A2"])).toEqual([
        { seatNumber: "A3", seatType: SEAT_TYPES.PREMIUM },
        { seatNumber: "A1", seatType: SEAT_TYPES.WHEELCHAIR },
        { seatNumber: "A2", seatType: SEAT_TYPES.STANDARD },
      ]);
    });

    test("returns an empty array when nothing matches", () => {
      expect(getSeatsByNumbers(show, ["Z1", "Z2"])).toEqual([]);
    });
  });
});

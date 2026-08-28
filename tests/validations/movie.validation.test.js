const {
  dateQuerySchema,
  movieListQuerySchema,
  holdOrBookSeatsSchema,
} = require("../../src/validations/movie.validation");

describe("movie validation schemas", () => {
  test("dateQuerySchema rejects invalid date format", () => {
    const { error } = dateQuerySchema.validate({ date: "08-25-2026" });
    expect(error).toBeDefined();
  });

  test("movieListQuerySchema enforces upper limit", () => {
    const { error } = movieListQuerySchema.validate({ page: 1, limit: 500 });
    expect(error).toBeDefined();
  });

  test("holdOrBookSeatsSchema rejects invalid seat format", () => {
    const { error } = holdOrBookSeatsSchema.validate({
      seatNumber: ["12A"],
    });
    expect(error).toBeDefined();
  });
});

const validate = require("../../src/middleware/validate");
const AppError = require("../../src/utils/appError");

describe("validate middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };

    res = {};
    next = jest.fn();
  });

  test("passes validated body data through and strips unknown fields", () => {
    const schema = {
      validate: jest.fn().mockReturnValue({
        value: {
          name: "Yogesh",
          email: "yogesh@example.com",
        },
        error: null,
      }),
    };

    req.body = {
      name: "Yogesh",
      email: "yogesh@example.com",
      extraField: "remove-me",
    };

    const originalBody = { ...req.body };

    validate(schema)(req, res, next);

    expect(schema.validate).toHaveBeenCalledWith(originalBody, {
      abortEarly: false,
      stripUnknown: true,
    });

    expect(req.body).toEqual({
      name: "Yogesh",
      email: "yogesh@example.com",
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test("can validate a non-body property such as query", () => {
    const schema = {
      validate: jest.fn().mockReturnValue({
        value: {
          page: 2,
        },
        error: null,
      }),
    };

    req.query = {
      page: 2,
      junk: true,
    };

    const originalQuery = { ...req.query };

    validate(schema, "query")(req, res, next);

    expect(schema.validate).toHaveBeenCalledWith(originalQuery, {
      abortEarly: false,
      stripUnknown: true,
    });

    expect(req.query).toEqual({
      page: 2,
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test("creates an AppError with all validation messages when schema fails", () => {
    const schema = {
      validate: jest.fn().mockReturnValue({
        value: {},
        error: {
          details: [
            { message: '"email" is required' },
            { message: '"name" is required' },
          ],
        },
      }),
    };

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain('"email" is required');
    expect(error.message).toContain('"name" is required');
  });

  test("stops execution after a validation error", () => {
    const schema = {
      validate: jest.fn().mockReturnValue({
        value: {},
        error: {
          details: [{ message: "bad data" }],
        },
      }),
    };

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });
});

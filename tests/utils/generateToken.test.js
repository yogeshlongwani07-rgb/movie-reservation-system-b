jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../src/utils/generateToken");

describe("generateToken utility", () => {
  const payload = { _id: "user-123", role: "user" };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
  });

  test("generateAccessToken signs the correct payload with the access secret", () => {
    jwt.sign.mockReturnValue("access-token");

    const token = generateAccessToken(payload);

    expect(token).toBe("access-token");
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledWith(
      { role: "user", _id: "user-123" },
      "test-access-secret",
      { expiresIn: "15m" },
    );
  });

  test("generateRefreshToken signs the correct payload with the refresh secret", () => {
    jwt.sign.mockReturnValue("refresh-token");

    const token = generateRefreshToken(payload);

    expect(token).toBe("refresh-token");
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledWith(
      { role: "user", _id: "user-123" },
      "test-refresh-secret",
      { expiresIn: "7d" },
    );
  });

  test("both token generators use only role and _id from the input object", () => {
    jwt.sign.mockReturnValue("token");

    generateAccessToken({
      _id: "abc",
      role: "admin",
      email: "admin@example.com",
      password: "secret",
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      { role: "admin", _id: "abc" },
      "test-access-secret",
      { expiresIn: "15m" },
    );
    expect(jwt.sign.mock.calls[0][0]).not.toHaveProperty("email");
    expect(jwt.sign.mock.calls[0][0]).not.toHaveProperty("password");
  });
});

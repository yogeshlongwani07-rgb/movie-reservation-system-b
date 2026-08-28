jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../src/utils/generateToken", () => ({
  generateAccessToken: jest.fn(() => "fresh-access-token"),
}));

const jwt = require("jsonwebtoken");
const { refreshAccessToken } = require("../../src/utils/authFlows");

describe("authFlows.refreshAccessToken", () => {
  const repository = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REFRESH_TOKEN_SECRET = "test-secret";
  });

  test("returns a fresh access token for a valid refresh token", async () => {
    jwt.verify.mockReturnValue({ _id: "user-1" });
    repository.findById.mockResolvedValue({
      _id: "user-1",
      refreshToken: "valid-refresh",
      role: "user",
    });

    const token = await refreshAccessToken("valid-refresh", repository);

    expect(token).toBe("fresh-access-token");
    expect(repository.findById).toHaveBeenCalledWith("user-1");
  });

  test("throws when refresh token does not match stored token", async () => {
    jwt.verify.mockReturnValue({ _id: "user-1" });
    repository.findById.mockResolvedValue({
      _id: "user-1",
      refreshToken: "different-refresh",
      role: "user",
    });

    await expect(
      refreshAccessToken("valid-refresh", repository),
    ).rejects.toThrow("Invalid refresh token");
  });
});

jest.mock("../../src/repositories/user.repository", () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findById: jest.fn(),
  findByIdWithSession: jest.fn(),
  findByIdWithSessionAndMovie: jest.fn(),
  saveWithSession: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../../src/utils/generateToken", () => ({
  generateAccessToken: jest.fn(() => "access-token"),
  generateRefreshToken: jest.fn(() => "refresh-token"),
}));

const bcrypt = require("bcrypt");
const UserRepository = require("../../src/repositories/user.repository");
const UserDomain = require("../../src/domain/user-domain");

describe("UserDomain.registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates a new user and returns tokens", async () => {
    UserRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");
    UserRepository.create.mockResolvedValue({
      _id: "u1",
      name: "Yogesh",
      email: "yogesh@example.com",
      role: "user",
    });
    UserRepository.save.mockResolvedValue(true);

    const result = await UserDomain.registerUser(
      "Yogesh",
      "plain-password",
      "yogesh@example.com",
    );

    expect(UserRepository.findByEmail).toHaveBeenCalledWith(
      "yogesh@example.com",
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("plain-password", 10);
    expect(UserRepository.create).toHaveBeenCalledWith({
      name: "Yogesh",
      password: "hashed-password",
      email: "yogesh@example.com",
    });
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  test("throws when email already exists", async () => {
    UserRepository.findByEmail.mockResolvedValue({
      email: "existing@example.com",
    });

    await expect(
      UserDomain.registerUser("Yogesh", "123", "existing@example.com"),
    ).rejects.toThrow("Email already exists");
  });
});

const UserDomain = require("../../src/services/user-domain");
const UserRepository = require("../../src/repositories/user.repository");
const AppError = require("../../src/utils/appError");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../src/utils/generateToken");
const { BOOKING_STATUS } = require("../../src/Constants");

jest.mock("../../src/repositories/user.repository");
jest.mock("bcrypt");
jest.mock("../../src/utils/generateToken");

describe("User Domain Service", () => {
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockUserData = {
    _id: mockUserId,
    name: "Test User",
    email: "test@example.com",
    password: "hashedpassword",
    refreshToken: "old-refresh-token",
    role: "user",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SALT_ROUNDS = "10";
    process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

    // Setup default mocks for token generation
    generateAccessToken.mockReturnValue("mock-access-token");
    generateRefreshToken.mockReturnValue("mock-refresh-token");
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      UserRepository.create = jest.fn().mockResolvedValue(mockUserData);
      UserRepository.save = jest.fn().mockResolvedValue();

      const result = await UserDomain.registerUser(
        "Test User",
        "password123",
        "test@example.com",
      );

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should throw error if email already exists", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(mockUserData);

      await expect(
        UserDomain.registerUser("Test User", "password123", "test@example.com"),
      ).rejects.toThrow(AppError);
    });

    it("should hash password with correct salt rounds", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      UserRepository.create = jest.fn().mockResolvedValue(mockUserData);
      UserRepository.save = jest.fn().mockResolvedValue();

      await UserDomain.registerUser(
        "Test User",
        "password123",
        "test@example.com",
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should call token generation functions", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      UserRepository.create = jest.fn().mockResolvedValue(mockUserData);
      UserRepository.save = jest.fn().mockResolvedValue();

      await UserDomain.registerUser(
        "Test User",
        "password123",
        "test@example.com",
      );

      expect(generateAccessToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
    });

    it("should handle registration errors", async () => {
      UserRepository.findByEmail = jest
        .fn()
        .mockRejectedValue(new Error("DB Error"));

      await expect(
        UserDomain.registerUser("Test User", "password123", "test@example.com"),
      ).rejects.toThrow();
    });
  });

  describe("userLogin", () => {
    it("should login user successfully with correct password", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      UserRepository.save = jest.fn().mockResolvedValue();

      const result = await UserDomain.userLogin(
        "test@example.com",
        "password123",
      );

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw error if user not found", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(
        UserDomain.userLogin("nonexistent@example.com", "password123"),
      ).rejects.toThrow(AppError);
    });

    it("should throw error if password is incorrect", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(
        UserDomain.userLogin("test@example.com", "wrongpassword"),
      ).rejects.toThrow(AppError);
    });

    it("should update refresh token on login", async () => {
      const userWithSave = { ...mockUserData, save: jest.fn() };
      UserRepository.findByEmail = jest.fn().mockResolvedValue(userWithSave);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      UserRepository.save = jest.fn().mockResolvedValue();

      await UserDomain.userLogin("test@example.com", "password123");

      expect(UserRepository.save).toHaveBeenCalled();
    });

    it("should call token generation on successful login", async () => {
      UserRepository.findByEmail = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      UserRepository.save = jest.fn().mockResolvedValue();

      await UserDomain.userLogin("test@example.com", "password123");

      expect(generateAccessToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
    });
  });

  describe("userDelete", () => {
    it("should delete user successfully", async () => {
      UserRepository.findByIdAndDelete = jest
        .fn()
        .mockResolvedValue(mockUserData);

      await UserDomain.userDelete(mockUserId);

      expect(UserRepository.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
    });

    it("should throw error if user not found", async () => {
      UserRepository.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await expect(UserDomain.userDelete("invalidid")).rejects.toThrow(
        AppError,
      );
    });
  });

  describe("showMyBookings", () => {
    it("should return user bookings", async () => {
      const userWithBookings = {
        ...mockUserData,
        bookings: [{ _id: "booking1", status: "Confirmed" }],
      };
      UserRepository.findById = jest.fn().mockResolvedValue(userWithBookings);

      const result = await UserDomain.showMyBookings(mockUserId);

      expect(result).toEqual(userWithBookings);
      expect(result.bookings).toBeDefined();
    });

    it("should throw error if user not found", async () => {
      UserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(UserDomain.showMyBookings("invalidid")).rejects.toThrow(
        AppError,
      );
    });
  });

  describe("makeFreshAccessToken", () => {
    it("should generate fresh access token with valid refresh token", async () => {
      const mockRefreshToken = "valid-refresh-token";
      const decodedToken = { _id: mockUserId, role: "user" };

      // Mock the user with matching refresh token
      const userWithMatchingToken = {
        ...mockUserData,
        refreshToken: mockRefreshToken,
      };

      // Mock jwt.verify to return decoded token
      const jwt = require("jsonwebtoken");
      jwt.verify = jest.fn().mockReturnValue(decodedToken);

      UserRepository.findById = jest
        .fn()
        .mockResolvedValue(userWithMatchingToken);
      generateAccessToken.mockReturnValue("new-access-token");

      const result = await UserDomain.makeFreshAccessToken(mockRefreshToken);

      expect(result).toBe("new-access-token");
      expect(jwt.verify).toHaveBeenCalledWith(
        mockRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      expect(generateAccessToken).toHaveBeenCalledWith(userWithMatchingToken);
    });

    it("should throw error if refresh token is missing", async () => {
      await expect(UserDomain.makeFreshAccessToken(null)).rejects.toThrow(
        AppError,
      );
    });

    it("should throw error if user not found", async () => {
      const mockRefreshToken = "valid-refresh-token";
      const decodedToken = { _id: mockUserId };

      const jwt = require("jsonwebtoken");
      jwt.verify = jest.fn().mockReturnValue(decodedToken);
      UserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        UserDomain.makeFreshAccessToken(mockRefreshToken),
      ).rejects.toThrow(AppError);
    });

    it("should throw error if refresh token does not match stored token", async () => {
      const mockRefreshToken = "valid-refresh-token";
      const differentRefreshToken = "different-token";
      const decodedToken = { _id: mockUserId };

      const jwt = require("jsonwebtoken");
      jwt.verify = jest.fn().mockReturnValue(decodedToken);
      UserRepository.findById = jest.fn().mockResolvedValue({
        ...mockUserData,
        refreshToken: differentRefreshToken,
      });

      await expect(
        UserDomain.makeFreshAccessToken(mockRefreshToken),
      ).rejects.toThrow(AppError);
    });

    it("should throw error if jwt verification fails", async () => {
      const mockRefreshToken = "invalid-token";

      const jwt = require("jsonwebtoken");
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error("JWT verification failed");
      });

      await expect(
        UserDomain.makeFreshAccessToken(mockRefreshToken),
      ).rejects.toThrow();
    });
  });

  describe("cancelBooking", () => {
    it("should cancel booking successfully", async () => {
      const mockSession = {};

      const booking = {
        _id: "booking1",
        status: "Confirmed",
        seats: [{ seatId: "seat1", seatNumber: "A1" }],
        showId: "show1",
        movie: "movie1",
        totalPrice: 100,
        cancelledAt: null,
        id: jest.fn().mockReturnThis(),
      };

      const userWithBooking = {
        ...mockUserData,
        bookings: {
          id: jest.fn().mockReturnValue(booking),
        },
      };

      const seat = {
        status: "Booked",
      };

      const show = {
        seats: {
          id: jest.fn().mockReturnValue(seat),
        },
        availableSeats: 5,
        occupiedSeats: 15,
        id: jest.fn().mockReturnThis(),
      };

      const movie = {
        shows: {
          id: jest.fn().mockReturnValue(show),
        },
      };

      UserRepository.findByIdWithSession = jest
        .fn()
        .mockResolvedValue(userWithBooking);
      UserRepository.findByIdWithSessionAndMovie = jest
        .fn()
        .mockResolvedValue(movie);
      UserRepository.saveWithSession = jest.fn().mockResolvedValue();

      const result = await UserDomain.cancelBooking(
        "booking1",
        mockSession,
        mockUserId,
      );

      expect(result).toHaveProperty("cancelledSeats");
      expect(result).toHaveProperty("refundAmount");
      expect(result.refundAmount).toBe(100);
      expect(result.cancelledSeats).toContain("A1");
    });

    it("should throw error if user not found", async () => {
      const mockSession = {};

      UserRepository.findByIdWithSession = jest.fn().mockResolvedValue(null);

      await expect(
        UserDomain.cancelBooking("booking1", mockSession, mockUserId),
      ).rejects.toThrow(AppError);
    });

    it("should throw error if booking not found", async () => {
      const mockSession = {};

      const userWithBooking = {
        ...mockUserData,
        bookings: {
          id: jest.fn().mockReturnValue(null),
        },
      };

      UserRepository.findByIdWithSession = jest
        .fn()
        .mockResolvedValue(userWithBooking);

      await expect(
        UserDomain.cancelBooking("invalidbooking", mockSession, mockUserId),
      ).rejects.toThrow(AppError);
    });

    it("should not cancel already cancelled booking", async () => {
      const mockSession = {};

      const cancelledBooking = {
        _id: "booking1",
        status: BOOKING_STATUS.CANCELLED,
        id: jest.fn().mockReturnThis(),
      };

      const userWithBooking = {
        ...mockUserData,
        bookings: {
          id: jest.fn().mockReturnValue(cancelledBooking),
        },
      };

      UserRepository.findByIdWithSession = jest
        .fn()
        .mockResolvedValue(userWithBooking);

      await expect(
        UserDomain.cancelBooking("booking1", mockSession, mockUserId),
      ).rejects.toThrow(AppError);
    });

    it("should throw error if movie not found", async () => {
      const mockSession = {};

      const booking = {
        _id: "booking1",
        status: "Confirmed",
        seats: [{ seatId: "seat1", seatNumber: "A1" }],
        showId: "show1",
        movie: "movie1",
        totalPrice: 100,
        id: jest.fn().mockReturnThis(),
      };

      const userWithBooking = {
        ...mockUserData,
        bookings: {
          id: jest.fn().mockReturnValue(booking),
        },
      };

      UserRepository.findByIdWithSession = jest
        .fn()
        .mockResolvedValue(userWithBooking);
      UserRepository.findByIdWithSessionAndMovie = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        UserDomain.cancelBooking("booking1", mockSession, mockUserId),
      ).rejects.toThrow(AppError);
    });

    it("should throw error if show not found", async () => {
      const mockSession = {};

      const booking = {
        _id: "booking1",
        status: "Confirmed",
        seats: [{ seatId: "seat1", seatNumber: "A1" }],
        showId: "show1",
        movie: "movie1",
        totalPrice: 100,
        id: jest.fn().mockReturnThis(),
      };

      const userWithBooking = {
        ...mockUserData,
        bookings: {
          id: jest.fn().mockReturnValue(booking),
        },
      };

      const movie = {
        shows: {
          id: jest.fn().mockReturnValue(null),
        },
      };

      UserRepository.findByIdWithSession = jest
        .fn()
        .mockResolvedValue(userWithBooking);
      UserRepository.findByIdWithSessionAndMovie = jest
        .fn()
        .mockResolvedValue(movie);

      await expect(
        UserDomain.cancelBooking("booking1", mockSession, mockUserId),
      ).rejects.toThrow(AppError);
    });
  });
});

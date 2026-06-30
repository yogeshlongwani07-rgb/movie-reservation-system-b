const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

class UserDomain {
  async registerUser(name, password, email) {
    const duplicateEmail = await UserRepository.findByEmail(email);
    if (duplicateEmail) {
      throw new AppError("Email already exists", 409);
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await UserRepository.create({
      name,
      password: hashPassword,
      email,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    newUser.refreshToken = refreshToken;
    await UserRepository.save(newUser);
    return { accessToken, refreshToken };
  }

  async userLogin(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not Found", 400);
    }
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      throw new AppError("Invalid Credentials", 400);
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await UserRepository.save(user);
    return { accessToken, refreshToken };
  }
  async userDelete(id) {
    const user = await UserRepository.findByIdAndDelete(id);
    if (!user) {
      throw new AppError("User not Found", 404);
    }
  }
  async showMyBookings(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError("User not Found", 404);
    }
    return user;
  }
  async cancelBooking(bookingId, session, userId) {
    const user = await UserRepository.findByIdWithSession(userId, session);
    if (!user) {
      throw new AppError("User not Found", 404);
    }
    const bookingIndex = user.bookings.findIndex(
      (booking) => booking.showId.toString() === bookingId,
    );
    if (bookingIndex === -1) {
      throw new AppError("Booking not Found", 404);
    }
    if (user.bookings[bookingIndex].status === "Cancelled") {
      throw new AppError("Booking is already cancelled", 404);
    }
    user.bookings[bookingIndex].status = "Cancelled";

    const movieID = user.bookings[bookingIndex].movie.toString();
    const movie = await UserRepository.findByIdWithSessionAndMovie(
      movieID,
      session,
    );
    if (movie) {
      const show = movie.shows.id(user.bookings[bookingIndex].showId);
      if (show) {
        show.availableSeats += user.bookings[bookingIndex].seats;
      } else {
        throw new AppError("Show not found", 404);
      }
    } else {
      throw new AppError("Movie not found", 404);
    }
    await UserRepository.saveWithSession(movie, session);
    await UserRepository.saveWithSession(user, session);
  }

  async makeFreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Refresh token Not Found", 400);
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await UserRepository.findById(decoded._id);
    if (!user) {
      throw new AppError("User not Found", 400);
    }
    if (user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 405);
    }
    const accessToken = generateAccessToken(user);
    return accessToken;
  }
}

module.exports = new UserDomain();

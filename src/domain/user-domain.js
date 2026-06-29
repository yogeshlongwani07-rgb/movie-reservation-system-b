const Movie = require("../models/movie");
const bcrypt = require("bcrypt");
const validator = require("validator");

const AdminDomain = require("../domain/admin-domain");
const AppError = require("../utils/appError");
const generateToken = require("../utils/generateToken");
const User = require("../models/user");

class UserDomain {
  async registerUser(name, password, email) {
    if (!name || !password || !email) {
      throw new AppError("Missing required field", 400);
    }
    email = email.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw new AppError("Invalid email address", 400);
    }
    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      throw new AppError("Email already exis", 409);
    }
    if (password.length < 6) {
      throw new AppError("Password length should be more than 6", 400);
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      password: hashPassword,
      email,
    });
    const token = generateToken(newUser);
    return { token };
  }

  async userLogin(email, password, role) {
    if (!email || !password) {
      throw new AppError("Missing required field", 400);
    }
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not Found", 400);
    }
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      throw new AppError("Invalid Credentials", 400);
    }
    const token = generateToken(user);
    return { token };
  }
  async userDelete(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError("User not Found", 404);
    }
  }
  async showMyBookings(userId) {
    const user = await User.findById(userId).populate("bookings");
    if (!user) {
      throw new AppError("User not Found", 404);
    }
    return user;
  }
  async cancelBooking(bookingId, session, userId) {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError("User not Found", 404);
      await session.abortTransaction();
    }
    const bookingIndex = user.bookings.findIndex(
      (booking) => booking.showId.toString() === bookingId,
    );
    if (bookingIndex === -1) {
      await session.abortTransaction();
      throw new AppError("Booking not Found", 404);
    }
    if (user.bookings[bookingIndex].status === "Cancelled") {
      await session.abortTransaction();
      throw new AppError("Booking is already cancelled", 404);
    }
    user.bookings[bookingIndex].status = "Cancelled";

    const movieID = user.bookings[bookingIndex].movie.toString();
    const movie = await Movie.findById(movieID).session(session);
    if (movie) {
      const show = movie.shows.id(user.bookings[bookingIndex].showId);
      if (show) {
        show.availableSeats += user.bookings[bookingIndex].seats;
      } else {
        await session.abortTransaction();
        throw new AppError("Show not found", 404);
      }
    } else {
      await session.abortTransaction();
      throw new AppError("Movie not found", 404);
    }
    await movie.save({ session });
    await user.save({ session });
  }
}

module.exports = new UserDomain();

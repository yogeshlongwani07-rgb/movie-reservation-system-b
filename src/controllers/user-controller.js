const { User } = require("../models/user-admin");
const validator = require("validator");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const Movie = require("../models/movie-listing");

async function registerUser(req, res) {
  try {
    const { name, password, email } = req.body;

    if (!name || !password || !email)
      return res
        .status(400)
        .json({ message: "Missing required field", success: false });

    if (!validator.isEmail(email))
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });

    const duplicateEmail = await User.findOne({ email });

    if (duplicateEmail)
      return res
        .status(409)
        .json({ message: "Email already exist", success: false });

    if (password.length < 6)
      return res.status(400).json({
        message: "Password length should be more than 6",
        success: false,
      });
    const saltRounds = Number(process.env.SALT_ROUNDS);

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      password: hashPassword,
      email,
    });
    const SECRET = process.env.SECRET_JWT;
    const token = jwt.sign(
      { email: newUser.email, _id: newUser._id, role: "user" },
      SECRET,
      {
        expiresIn: "7h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(201)
      .json({ message: "Account Created", success: true, token: token });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password, role } = req.body;
    if (role)
      return res.status(403).json({
        message: "You are not authorized to create admin account",
        success: false,
      });
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Missing required field", success: false });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword)
      return res
        .status(400)
        .json({ message: "Invalid Credentials", success: false });

    const SECRET = process.env.SECRET_JWT;
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      SECRET,
      {
        expiresIn: "7h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Your are Login!", success: true, token: token });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function deleteUser(req, res) {
  try {
    let id = req.user._id;

    const user = await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function checkMyBookings(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("bookings");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).json({ bookings: user.bookings });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function cancelBooking(req, res) {
  try {
    const bookingId = req.params.bookingId;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const bookingIndex = user.bookings.findIndex(
      (booking) => booking._id.toString() === bookingId,
    );
    if (bookingIndex === -1) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }
    if (user.bookings[bookingIndex].status === "Cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
        success: false,
      });
    }
    user.bookings[bookingIndex].status = "Cancelled";
    const movieID = user.bookings[bookingIndex].movie.toString();
    const movie = await Movie.findById(movieID);
    if (movie) {
      const show = movie.shows.id(user.bookings[bookingIndex].showId);
      if (show) {
        show.availableSeats += user.bookings[bookingIndex].seats;
      }
    }
    await movie.save();
    await user.save();
    res.json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  checkMyBookings,
  cancelBooking,
};

const User = require("../models/user");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Movie = require("../models/movie");
const generateToken = require("../utils/generateToken");
const UserDomain = require("../domain/user-domain");

const mongoose = require("mongoose");
const AppError = require("../utils/appError");

async function registerUser(req, res) {
  try {
    let { name, password, email } = req.body;

    const user = await UserDomain.registerUser(name, password, email);
    const { token } = user;
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
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function loginUser(req, res) {
  try {
    let { email, password, role } = req.body;

    const user = await UserDomain.userLogin(email, password, role);
    const { token } = user;
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
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
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
    const user = await UserDomain.userDelete(id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
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
    const user = await UserDomain.showMyBookings(userId);
    res.status(200).json({ bookings: user.bookings });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  }
}

async function cancelBooking(req, res) {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { bookingId } = req.params;
    const userId = req.user._id;
    const user = await UserDomain.cancelBooking(bookingId, session, userId);

    await session.commitTransaction();
    res.json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (err) {
    await session.abortTransaction();
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  } finally {
    await session.endSession();
  }
}

module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  checkMyBookings,
  cancelBooking,
};

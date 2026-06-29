const User = require("../models/user");
const UserDomain = require("../domain/user-domain");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generateToken");

async function registerUser(req, res) {
  try {
    let { name, password, email } = req.body;

    const user = await UserDomain.registerUser(name, password, email);
    const { accessToken, refreshToken } = user;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(201)
      .json({ message: "Account Created", success: true, token: accessToken });
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
    const { accessToken, refreshToken } = user;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Your are Login!", success: true, token: accessToken });
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

async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  checkMyBookings,
  cancelBooking,
  refreshAccessToken,
};

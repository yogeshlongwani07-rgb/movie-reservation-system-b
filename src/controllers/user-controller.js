const UserDomain = require("../services/user-domain");
const AppError = require("../utils/appError");
const setAuthCookies = require("../utils/setAuthCookies");
const { withTransaction } = require("../utils/withTrasaction");

async function registerUser(req, res) {
  try {
    let { name, password, email } = req.body;

    const user = await UserDomain.registerUser(name, password, email);
    const { accessToken, refreshToken } = user;
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({ message: "Account Created", success: true });
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
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({ message: "Your are Login!", success: true });
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
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
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

async function getMyProfile(req, res) {
  try {
    const userId = req.user._id;
    const user = await UserDomain.getProfile(userId);
    res.status(200).json({ success: true, message: "Authenticated", user });
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
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const user = await withTransaction((session) =>
      UserDomain.cancelBooking(bookingId, session, userId),
    );
    const { cancelledSeats, refundAmount } = user;
    res.json({
      success: true,
      message: "Booking cancelled",
      cancelledSeats,
      refundAmount,
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

async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = await UserDomain.makeFreshAccessToken(refreshToken);

    setAuthCookies(res, accessToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
}

async function logout(req, res) {
  try {
    let userId = req.user._id;
    let response = await UserDomain.logout(userId);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({
      success: true,
      message: "Logged out",
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
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
  getMyProfile,
  checkMyBookings,
  cancelBooking,
  refreshAccessToken,
  logout,
};

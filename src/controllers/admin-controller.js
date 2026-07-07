const AdminDomain = require("../services/admin-domain");
const AppError = require("../utils/appError");
const { mongoose } = require("mongoose");
const { FIFTEEN_MINUTES_MS, SEVEN_DAYS_MS } = require("../Constants");

async function registerAdmin(req, res) {
  try {
    let { name, password, email, role, passkey } = req.body;

    const admin = await AdminDomain.createAdmin(
      name,
      password,
      email,
      role,
      passkey,
    );
    const { accessToken, refreshToken } = admin;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: FIFTEEN_MINUTES_MS,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SEVEN_DAYS_MS,
    });
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

async function loginAdmin(req, res) {
  try {
    let { email, password } = req.body;
    const admin = await AdminDomain.loginAdmin(email, password);
    const { accessToken, refreshToken } = admin;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: FIFTEEN_MINUTES_MS,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SEVEN_DAYS_MS,
    });
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

async function deleteAdmin(req, res) {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    let id = req.user._id;
    const admin = await AdminDomain.deleteAdmin(id, session);

    await session.commitTransaction();
    res.json({
      success: true,
      message: "Admin and all movies deleted",
    });
  } catch (err) {
    if (err instanceof AppError) {
      await session.abortTransaction();
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    await session.abortTransaction();
    console.log("error", err);
    return res.status(500).json({
      message: "Unexpected Error",
      success: false,
    });
  } finally {
    await session.endSession();
  }
}
async function getMyProfile(req, res) {
  try {
    const adminId = req.user._id;
    const admin = await AdminDomain.getProfile(adminId);
    res
      .status(200)
      .json({ success: true, message: "Authenticated", user: admin });
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

async function checkListedMovies(req, res) {
  try {
    const adminId = req.user._id;
    const admin = await AdminDomain.showAdminMovies(adminId);
    res.status(200).json({ movies: admin.movies });
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
    const accessToken = await AdminDomain.makeFreshAccessToken(refreshToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: FIFTEEN_MINUTES_MS, // 15 minutes
    });

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
    const adminId = req.user._id;
    const response = await AdminDomain.logout(adminId);
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
  registerAdmin,
  loginAdmin,
  deleteAdmin,
  getMyProfile,
  checkListedMovies,
  refreshAccessToken,
  logout,
};

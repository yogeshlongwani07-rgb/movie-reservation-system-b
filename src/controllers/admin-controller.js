const AdminDomain = require("../services/admin-domain");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const setAuthCookies = require("../utils/setAuthCookies");
const { withTransaction } = require("../utils/withTransaction");

const registerAdmin = asyncHandler(async (req, res) => {
  let { name, password, email, role, passkey } = req.body;
  const admin = await AdminDomain.createAdmin(
    name,
    password,
    email,
    role,
    passkey,
  );
  const { accessToken, refreshToken } = admin;
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ message: "Account Created", success: true });
});

const loginAdmin = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  const admin = await AdminDomain.loginAdmin(email, password);
  const { accessToken, refreshToken } = admin;
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ message: "Your are Login!", success: true });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  let id = req.user._id;
  await withTransaction((session) => AdminDomain.deleteAdmin(id, session));
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Admin and all movies deleted",
  });
});
const getMyProfile = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const admin = await AdminDomain.getProfile(adminId);
  res
    .status(200)
    .json({ success: true, message: "Authenticated", user: admin });
});

const checkListedMovies = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const admin = await AdminDomain.showAdminMovies(adminId);
  res.status(200).json({ movies: admin.movies });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = await AdminDomain.makeFreshAccessToken(refreshToken);
  setAuthCookies(res, accessToken);

  return res.status(200).json({
    success: true,
    message: "Access token refreshed",
  });
});

const logout = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const response = await AdminDomain.logout(adminId);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Logged out",
  });
});

module.exports = {
  registerAdmin,
  loginAdmin,
  deleteAdmin,
  getMyProfile,
  checkListedMovies,
  refreshAccessToken,
  logout,
};

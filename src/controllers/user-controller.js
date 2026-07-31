const UserDomain = require("../services/user-service");
const asyncHandler = require("../utils/asyncHandler");
const setAuthCookies = require("../utils/setAuthCookies");
const { withTransaction } = require("../utils/withTransaction");
const {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} = require("../utils/cache");

const registerUser = asyncHandler(async (req, res) => {
  let { name, password, email } = req.body;

  const user = await UserDomain.registerUser(name, password, email);
  const { accessToken, refreshToken } = user;
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({ message: "Account Created successfully", success: true });
});

const loginUser = asyncHandler(async (req, res) => {
  let { email, password, role } = req.body;

  const user = await UserDomain.userLogin(email, password, role);
  const { accessToken, refreshToken } = user;
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({ message: "Login successfully", success: true });
});

const deleteUser = asyncHandler(async (req, res) => {
  let id = req.user._id;
  await UserDomain.userDelete(id);
  await deleteCache(`user:profile:${id}`, `user:bookings:${id}`);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "User deleted",
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cacheKey = `user:profile:${userId}`;
  const cachedProfile = await getCache(cacheKey);

  if (cachedProfile) {
    return res
      .status(200)
      .json({ success: true, message: "Authenticated", user: cachedProfile });
  }

  const user = await UserDomain.getProfile(userId);
  await setCache(cacheKey, user);
  res.status(200).json({ success: true, message: "Authenticated", user });
});

const checkMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cacheKey = `user:bookings:${userId}`;
  const cachedBookings = await getCache(cacheKey);

  if (cachedBookings) {
    return res.status(200).json({ bookings: cachedBookings });
  }

  const user = await UserDomain.showMyBookings(userId);
  await setCache(cacheKey, user.bookings, 30);
  res.status(200).json({ bookings: user.bookings });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;
  const user = await withTransaction((session) =>
    UserDomain.cancelBooking(bookingId, session, userId),
  );
  const { cancelledSeats, refundAmount, movieId, showId } = user;
  await deleteCache(
    `user:bookings:${userId}`,
    `movies:${movieId}:shows`,
    `movies:${movieId}:shows:${showId}`,
  );
  await deleteCacheByPattern("movies:date:*");
  res.json({
    success: true,
    message: "Booking cancelled",
    cancelledSeats,
    refundAmount,
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = await UserDomain.makeFreshAccessToken(refreshToken);

  setAuthCookies(res, accessToken);

  return res.status(200).json({
    success: true,
    message: "Access token refreshed",
  });
});

const logout = asyncHandler(async (req, res) => {
  let userId = req.user._id;
  await UserDomain.logout(userId);
  await deleteCache(`user:profile:${userId}`, `user:bookings:${userId}`);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Logged out",
  });
});

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

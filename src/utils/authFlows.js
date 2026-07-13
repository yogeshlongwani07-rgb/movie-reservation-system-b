const AppError = require("./appError");
const { generateAccessToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

async function refreshAccessToken(refreshToken, repository) {
  if (!refreshToken) {
    throw new AppError("Refresh token Not Found", 400);
  }
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const account = await repository.findById(decoded._id);
  if (!account) {
    throw new AppError("User not Found", 400);
  }
  if (account.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  const accessToken = generateAccessToken(account);
  return accessToken;
}

async function logout(id, repository) {
  const account = await repository.findById(id);
  if (!account) {
    throw new AppError("User not found", 404);
  }

  account.refreshToken = null;
  await repository.save(account);
}

module.exports = { logout, refreshAccessToken };

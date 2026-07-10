const { FIFTEEN_MINUTES_MS, SEVEN_DAYS_MS } = require("../Constants");

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: FIFTEEN_MINUTES_MS,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: SEVEN_DAYS_MS,
};

function setAuthCookies(res, accessToken, refreshToken = null) {
  res.cookie("accessToken", accessToken, accessCookieOptions);
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  }
}

module.exports = setAuthCookies;

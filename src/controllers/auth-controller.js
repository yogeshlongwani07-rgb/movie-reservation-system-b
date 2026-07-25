const AuthDomain = require("../services/auth-service");
const asyncHandler = require("../utils/asyncHandler");
const setAuthCookies = require("../utils/setAuthCookies");

const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  const { accessToken, refreshToken } = await AuthDomain.issueTokens(user);

  setAuthCookies(res, accessToken, refreshToken);

  return res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
});

module.exports = { googleCallback };

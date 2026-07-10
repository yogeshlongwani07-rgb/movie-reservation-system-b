const AuthDomain = require("../services/auth-domain");
const AppError = require("../utils/appError");
const setAuthCookies = require("../utils/setAuthCookies");

async function googleCallback(req, res) {
  try {
    const user = req.user;

    const { accessToken, refreshToken } = await AuthDomain.issueTokens(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "OAuth login failed",
    });
  }
}

module.exports = { googleCallback };

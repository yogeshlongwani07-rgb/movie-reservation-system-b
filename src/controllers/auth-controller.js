const AuthDomain = require("../services/auth-domain");
const AppError = require("../utils/appError");
const { FIFTEEN_MINUTES_MS, SEVEN_DAYS_MS } = require("../Constants");

async function googleCallback(req, res) {
  try {
    const user = req.user;

    const { accessToken, refreshToken } = await AuthDomain.issueTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: FIFTEEN_MINUTES_MS,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SEVEN_DAYS_MS,
    });

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

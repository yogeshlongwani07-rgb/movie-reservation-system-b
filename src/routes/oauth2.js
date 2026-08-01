const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { GOOGLE_AUTH_PAGE } = require("../Constants");

router.get("/google", (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state: state,
  });

  const url = GOOGLE_AUTH_PAGE + params.toString();
  res.redirect(url);
});

router.get("/google/callback", (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({
      message: "Authorization properties are missing",
      success: false,
    });
  }
  if (req.cookies.oauth_state != state) {
    return res.status(400).json({ message: "Invalid state", success: false });
  }

  res.clearCookie("oauth_state");
});

module.exports = router;

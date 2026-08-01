const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { GOOGLE_AUTH_PAGE, GOOGLE_CODE } = require("../Constants");
const { default: axios } = require("axios");
const { OAuth2Client } = require("google-auth-library");
const userRepository = require("../repositories/user.repository");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const setAuthCookies = require("../utils/setAuthCookies");
const { issueSessionTokens } = require("../utils/issueSessionTokens");

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
    prompt: "select_account",
    state: state,
  });

  const url = GOOGLE_AUTH_PAGE + params.toString();
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({
      message: "Authorization properties are missing",
      success: false,
    });
  }

  const savedState = req.cookies.oauth_state;

  if (!savedState || savedState !== state) {
    return res.status(400).json({
      success: false,
      message: "Invalid state",
    });
  }
  res.clearCookie("oauth_state");

  const tokenResponse = await axios.post(
    GOOGLE_CODE,
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  const { id_token } = tokenResponse.data;

  if (!id_token) {
    return res
      .status(400)
      .json({ message: "Google did not return ID Token", success: false });
  }
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    return res
      .status(400)
      .json({ message: "Invalid Google Token", success: false });
  }
  if (!payload.email_verified) {
    return res
      .status(400)
      .json({ message: "Email not verified", success: false });
  }
  let user = await userRepository.findByEmail(payload.email);

  if (!user) {
    user = await userRepository.create({
      name: payload.name,
      email: payload.email,
      provider: "google",
      providerId: payload.sub,
      role: "user",
    });
  } else {
    if (!user.providerId) {
      user.providerId = payload.sub;
    }

    user.provider = "google";

    await userRepository.save(user);
  }

  const { accessToken, refreshToken } = await issueSessionTokens(
    user,
    userRepository,
  );

  console.log("Access:", accessToken);
  console.log("Refresh:", refreshToken);

  setAuthCookies(res, accessToken, refreshToken);
  res
    .status(200)
    .json({ message: "Login with Google Successfully", success: true });
});

module.exports = router;

const express = require("express");
const passport = require("../config/passport");
const { googleCallback } = require("../controllers/auth-controller");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth`,
  }),
  googleCallback,
);

module.exports = router;

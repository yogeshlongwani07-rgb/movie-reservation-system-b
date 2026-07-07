const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const UserRepository = require("../repositories/user.repository");

class AuthDomain {
  async findOrCreateGoogleUser(profile) {
    const email = profile.email;
    const googleId = profile._id;
    const name = profile.name;
    const avatar = profile.avatar || null;
    if (!email) {
      throw new AppError("Google account email not found", 400);
    }
    let user = await UserRepository.findByProviderId(googleId);
    if (user) return user;

    user = await UserRepository.findByEmail(email);
    if (user) {
      user.provider = "google";
      user.providerId = googleId;
      user.avatar = avatar;
      await UserRepository.save(user);
      return user;
    }
    user = await UserRepository.create({
      name,
      email,
      provider: "google",
      providerId: googleId,
      avatar,
      password: null,
      role: "user",
    });
    return user;
  }

  async issueTokens(user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await UserRepository.save(user);
    return { accessToken, refreshToken };
  }
}

module.exports = new AuthDomain();

const AppError = require("../utils/appError");
const UserRepository = require("../repositories/user.repository");
const { issueSessionTokens } = require("../utils/issueSessionTokens");

class AuthDomain {
  async findOrCreateGoogleUser(profile) {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;
    const name = profile.name.givenName;
    const avatar = profile.photos?.[0]?.value || null;
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
    return issueSessionTokens(user, UserRepository);
  }
}

module.exports = new AuthDomain();

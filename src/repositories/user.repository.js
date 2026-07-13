const Movie = require("../models/movie");
const User = require("../models/user");
const BaseRepository = require("./base.repository");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }
  async findById(id) {
    return await User.findById(id).populate("bookings");
  }
  async findByProviderId(providerId) {
    return await User.findOne({ providerId });
  }
  async findByIdSafe(id) {
    return await User.findById(id).select("-password -refreshToken");
  }
  async findByIdWithSessionAndMovie(id, session) {
    return await Movie.findById(id).session(session);
  }
}

module.exports = new UserRepository();

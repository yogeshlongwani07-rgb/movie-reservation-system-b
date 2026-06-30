const Movie = require("../models/movie");
const User = require("../models/user");

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }
  async create(userData) {
    return await User.create(userData);
  }
  async save(user) {
    return await user.save();
  }
  async findByIdAndDelete(id) {
    return await User.findByIdAndDelete(id);
  }
  async findById(id) {
    return await User.findById(id).populate("bookings");
  }
  async findByIdWithSession(id, session) {
    return await User.findById(id).session(session);
  }
  async findByIdWithSessionAndMovie(id, session) {
    return await Movie.findById(id).session(session);
  }
  async saveWithSession(data, session) {
    return await data.save({ session });
  }
}

module.exports = new UserRepository();

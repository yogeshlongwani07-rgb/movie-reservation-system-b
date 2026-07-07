const Admin = require("../models/admin");
const Movie = require("../models/movie");

class AdminRepository {
  async findByEmail(email) {
    return await Admin.findOne({ email });
  }
  async create(adminData) {
    return await Admin.create(adminData);
  }
  async save(newAdmin) {
    return await newAdmin.save();
  }
  async deleteAdminMovieswithSession(id, session) {
    return await Movie.deleteMany({
      createdBy: id,
    }).session(session);
  }
  async findByIdAndDelete(id) {
    return await Admin.findByIdAndDelete(id);
  }

  async findByIdAndDeleteWithSession(id, session) {
    return await Admin.findByIdAndDelete(id).session(session);
  }
  async findById(id) {
    return await Admin.findById(id);
  }
  async findByIdSafe(id) {
    return await Admin.findById(id).select("-password -refreshToken");
  }
  async findByIdWithMovies(id) {
    return await Admin.findById(id).populate("movies");
  }
}

module.exports = new AdminRepository();

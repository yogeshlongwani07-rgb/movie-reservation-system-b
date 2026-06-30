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
  async deleteAdminMovies(id) {
    return await Movie.deleteMany({
      createdBy: id,
    });
  }
  async findByIdAndDelete(id) {
    return await Admin.findByIdAndDelete(id);
  }
  async findById(id) {
    return await Admin.findById(id);
  }
  async findByIdWithMovies(id) {
    return await Admin.findById(id).populate("movies");
  }
}

module.exports = new AdminRepository();

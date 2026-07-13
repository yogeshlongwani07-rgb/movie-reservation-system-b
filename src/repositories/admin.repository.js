const Admin = require("../models/admin");
const Movie = require("../models/movie");
const BaseRepository = require("./base.repository");

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }
  async deleteAdminMovieswithSession(id, session) {
    return await Movie.deleteMany({
      createdBy: id,
    }).session(session);
  }

  async findByIdAndDeleteWithSession(id, session) {
    return await Admin.findByIdAndDelete(id).session(session);
  }

  async findByIdSafe(id) {
    return await Admin.findById(id).select("-password -refreshToken");
  }
  async findByIdWithMovies(id) {
    return await Admin.findById(id).populate("movies");
  }
}

module.exports = new AdminRepository();

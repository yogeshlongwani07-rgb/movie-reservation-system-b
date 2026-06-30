const Admin = require("../models/admin");
const Movie = require("../models/movie");
const User = require("../models/user");

class MovieRepository {
  async create(data) {
    return await Movie.create(data);
  }
  async findByIdAndUpdate(id, movieId) {
    return await Admin.findByIdAndUpdate(id, {
      $push: { movies: movieId },
    });
  }
  async findMovies(limit, skip) {
    return await Movie.find({}).skip(skip).limit(limit);
  }
  async findById(id) {
    return await Movie.findById(id);
  }
  async save(data) {
    return await data.save();
  }
  async findByIdWithSession(id, session) {
    return await Movie.findById(id).session(session);
  }
  async findByIdWithSessionAndAdmin(id, session) {
    return await Admin.findById(id).session(session);
  }
  async deleteOne(data, session) {
    return await data.deleteOne({ session });
  }
  async checkMovieByDate(date) {
    return await Movie.aggregate([
      { $unwind: "$shows" },
      { $match: { "shows.date": date, "shows.availableSeats": { $gt: 0 } } },
      {
        $project: {
          title: 1,
          duration: 1,
          price: 1,
          rating: 1,
          shows: "$shows",
        },
      },
      { $sort: { "shows.showTime": 1 } },
    ]);
  }
  async findByIdWithSessionAndUser(id, session) {
    return await User.findById(id).session(session);
  }
  async saveWithSession(data, session) {
    return await data.save({ session });
  }
}

module.exports = new MovieRepository();

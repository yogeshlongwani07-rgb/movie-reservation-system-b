const Movie = require("../models/movie");
const User = require("../models/user");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");

class MovieDomain {
  async create(body, userId) {
    const listing = await Movie.create({
      ...body,
      createdBy: userId,
    });
    return listing;
  }
  async pushMovieToAdmin(userId, movieId) {
    await Admin.findByIdAndUpdate(userId, {
      $push: { movies: movieId },
    });
  }
  async allMovies() {
    const movie = await Movie.find({});
    return movie;
  }

  async updateMovie(id, userId) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== userId.toString()) {
      throw new AppError("You are not authorized", 403);
    }

    Object.assign(movie, req.body);
    await movie.save();
    return movie;
  }
}

module.exports = new MovieDomain();

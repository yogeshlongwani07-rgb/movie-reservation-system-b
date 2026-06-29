const Movie = require("../models/movie");
const User = require("../models/user");
const Admin = require("../models/admin");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

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

  async updateMovie(id, userId, body) {
    let movie = await Movie.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== userId.toString()) {
      throw new AppError("You are not authorized", 403);
    }

    Object.assign(movie, body);
    await movie.save();
    return movie;
  }
  async deleteMovie(id, userId) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== userId.toString()) {
      throw new AppError("You are not authorized", 403);
    }

    await movie.deleteOne();
    return movie;
  }
  async checkMovieByDate(date) {
    const shows = await Movie.aggregate([
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

    return shows;
  }
  async bookTickets(movieId, showId, seats, userId, session) {
    if (
      !mongoose.Types.ObjectId.isValid(movieId) ||
      !mongoose.Types.ObjectId.isValid(showId)
    ) {
      throw new AppError("Invalid movie or show ID", 400);
    }
    if (!Number.isInteger(seats)) {
      throw new AppError("Seats must be an Number", 400);
    }
    if (seats < 1 || seats > 10) {
      throw new AppError("You can book between 1 and 10 seats only", 400);
    }
    const movie = await Movie.findById(movieId).session(session);
    if (!movie) {
      await session.abortTransaction();
      throw new AppError("Movie not Found", 404);
    }
    const show = movie.shows.id(showId);
    if (!show) {
      await session.abortTransaction();
      throw new AppError("Show not Found", 404);
    }
    if (show.availableSeats < seats) {
      await session.abortTransaction();
      throw new AppError("Not enough seats available", 400);
    }
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      throw new AppError("User not Found", 404);
    }

    user.bookings.push({
      movie: movieId,
      status: "Confirmed",
      seats: seats,
      showId: showId,
    });

    show.availableSeats -= seats;
    await user.save({ session });
    await movie.save({ session });
  }
}

module.exports = new MovieDomain();

const Movie = require("../models/movie");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const MovieRepository = require("../repositories/movie.repository");

class MovieDomain {
  async create(body, userId) {
    const listing = await MovieRepository.create({
      ...body,
      createdBy: userId,
    });
    return listing;
  }
  async pushMovieToAdmin(userId, movieId) {
    await MovieRepository.findByIdAndUpdate(userId, movieId);
  }
  async allMovies(limit, skip) {
    const movie = await MovieRepository.findMovies(limit, skip);
    return movie;
  }

  async updateMovie(id, userId, body) {
    let movie = await MovieRepository.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== userId.toString()) {
      throw new AppError("You are not authorized", 403);
    }

    Object.assign(movie, body);
    await MovieRepository.save(movie);
    return movie;
  }

  async deleteMovie(id, userId, session) {
    const stringUserId = userId.toString();
    const movie = await MovieRepository.findByIdWithSession(id, session);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== stringUserId) {
      throw new AppError("You are not authorized", 403);
    }

    const admin = await MovieRepository.findByIdWithSessionAndAdmin(
      stringUserId,
      session,
    );

    admin.movies = admin.movies.filter((movie) => {
      return movie.toString() !== id;
    });

    await MovieRepository.saveWithSession(admin, session);
    await MovieRepository.deleteOne(movie, session);
    return movie;
  }

  async checkMovieByDate(date) {
    const shows = await MovieRepository.checkMovieByDate(date);
    return shows;
  }
  async bookTickets(movieId, showId, seats, userId, session) {
    const movie = await MovieRepository.findByIdWithSession(movieId, session);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    const show = movie.shows.id(showId);
    if (!show) {
      throw new AppError("Show not Found", 404);
    }
    if (show.availableSeats < seats) {
      throw new AppError("Not enough seats available", 400);
    }
    const user = await MovieRepository.findByIdWithSessionAndUser(
      userId,
      session,
    );
    if (!user) {
      throw new AppError("User not Found", 404);
    }

    user.bookings.push({
      movie: movieId,
      status: "Confirmed",
      seats: seats,
      showId: showId,
    });

    show.availableSeats -= seats;
    await MovieRepository.saveWithSession(user, session);
    await MovieRepository.saveWithSession(movie, session);
  }
}

module.exports = new MovieDomain();

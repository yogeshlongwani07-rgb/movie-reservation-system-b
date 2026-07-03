const Movie = require("../models/movie");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const MovieRepository = require("../repositories/movie.repository");
const { BOOKING_STATUS } = require("../Constants");
const { generateSeats } = require("../utils/seatGenerator");

class MovieDomain {
  async create(body, userId) {
    if (!body.shows || !Array.isArray(body.shows)) {
      throw new AppError("Atleast one Show required in correct format");
    }

    const newBody = {
      ...body,
      shows: body.shows?.map((show) => {
        const seats = generateSeats(
          show.layout?.rows || 10,
          show.layout?.columns || 15,
        );

        return {
          ...show,
          seats,
          totalSeats: seats.length,
          availableSeats: seats.length,
          occupiedSeats: 0,
          lockedSeats: 0,
        };
      }),
    };

    const listing = await MovieRepository.create({
      ...newBody,
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
    console.log(seats);
    if (show.availableSeats < seats.length) {
      throw new AppError("Not enough seats available", 400);
    }
    const user = await MovieRepository.findByIdWithSessionAndUser(
      userId,
      session,
    );
    if (!user) {
      throw new AppError("User not Found", 404);
    }

    const totalPrice = seats.reduce((sum, seat) => {
      return sum + seat.price;
    }, 0);

    user.bookings.push({
      movie: movieId,
      status: BOOKING_STATUS.CONFIRMED,
      seats: seats,
      showId: showId,
      totalPrice,
    });

    show.availableSeats -= seats.length;
    await MovieRepository.saveWithSession(user, session);
    await MovieRepository.saveWithSession(movie, session);
  }
}

module.exports = new MovieDomain();

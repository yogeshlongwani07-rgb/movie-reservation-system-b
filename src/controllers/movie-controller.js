const Movie = require("../models/movie");
const Admin = require("../models/admin");
const MovieDomain = require("../domain/movie-domain");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

async function createMovie(req, res) {
  try {
    const listing = await MovieDomain.create(req.body, req.user._id);
    await MovieDomain.pushMovieToAdmin(req.user._id, listing._id);
    res.status(201).json({ message: "Movie added", success: true });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function getAllMovies(req, res) {
  try {
    const movie = await MovieDomain.allMovies();
    res.status(200).send(movie);
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    let body = req.body;
    const movie = await MovieDomain.updateMovie(id, req.user._id, body);

    res.json({ message: "Movie Updated", success: true });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    const movie = await MovieDomain.deleteMovie(id, req.user._id);

    res.json({ message: "Movie Deleted", success: true });
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function getAvailableShows(req, res) {
  try {
    const { date } = req.query;
    const shows = await MovieDomain.checkMovieByDate(date);
    res.status(200).send(shows);
  } catch (err) {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function createBooking(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { movieId, showId, seats } = req.body;
    const ticket = await MovieDomain.bookTickets(
      movieId,
      showId,
      seats,
      req.user._id,
      session,
    );
    await session.commitTransaction();

    res.status(201).json({
      message: "Show Booked successfully",
      success: true,
      booking: {
        movieId,
        showId,
        seats: seats,
        status: "Confirmed",
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      await session.abortTransaction();
      return res
        .status(err.statusCode)
        .json({ message: err.message, success: false });
    }
    await session.abortTransaction();
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  } finally {
    await session.endSession();
  }
}

module.exports = {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  getAvailableShows,
  createBooking,
};

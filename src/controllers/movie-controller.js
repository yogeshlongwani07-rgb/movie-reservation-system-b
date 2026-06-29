const Movie = require("../models/movie");
const User = require("../models/user");
const Admin = require("../models/admin");
const MovieDomain = require("../domain/movie-domain");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

async function createMovieListing(req, res) {
  try {
    const listing = await MovieDomain.create(req.body, req.user._id);
    await MovieDomain.pushMovieToAdmin(req.user._id, listing._id);
    res.status(201).json({ message: "Movie added", success: true });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "Unexpected Error", success: false });
  }
}

async function allMovies(req, res) {
  try {
    const movie = await MovieDomain.allMovies();
    res.status(200).send(movie);
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "Unexpected Error", success: false });
  }
}

async function updateMovieListing(req, res) {
  try {
    const { id } = req.params;
    const movie = await MovieDomain.updateMovie(id, req.user._id);

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

async function deleteMovieListing(req, res) {
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

async function checkAvailableShows(req, res) {
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

async function bookMovieShow(req, res) {
  const session = await mongoose.startSession();
  try {
    const { movieId, showId, seats } = req.body;
    const ticket = await MovieDomain.bookTickets(
      movieId,
      showId,
      seats,
      req.user._id,
      session,
    );

    res.status(200).json({
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
  createMovieListing,
  updateMovieListing,
  deleteMovieListing,
  allMovies,
  checkAvailableShows,
  bookMovieShow,
};

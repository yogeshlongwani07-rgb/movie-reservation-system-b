const MovieDomain = require("../services/movie-domain");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../Constants");
const { emitToShow } = require("../socket/socketManager");
const { withTransaction } = require("../utils/withTrasaction");

async function createMovie(req, res) {
  try {
    if (req.file) {
      req.body.poster = req.file.path;
    }
    const listing = await MovieDomain.create(req.body, req.user._id);
    await MovieDomain.pushMovieToAdmin(req.user._id, listing._id);
    res.status(201).json({ message: "Movie added", success: true });
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

async function getAllMovies(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const movie = await MovieDomain.allMovies(limit, skip);
    res.status(200).send(movie);
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    if (req.file) {
      req.body.poster = req.file.path;
    }
    const movie = await MovieDomain.updateMovie(id, req.user._id, req.body);

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
    await withTransaction((session) =>
      MovieDomain.deleteMovie(id, req.user._id, session),
    );
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

async function movieByDate(req, res) {
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

async function checkMovieShows(req, res) {
  try {
    const movieId = req.params.id;

    const movie = await MovieDomain.checkShows(movieId);
    res.status(200).json({ message: "Success", success: true, shows: movie });
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

async function checkMovieShow(req, res) {
  const movieId = req.params.id;
  const showId = req.params.showId;
  try {
    const movie = await MovieDomain.checkShow(movieId, showId);
    res.status(200).json({ message: "Success", success: true, show: movie });
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

async function holdSeats(req, res) {
  try {
    const movieId = req.params.id;
    const showId = req.params.showId;
    const seats = req.body.seatNumber;
    const ticket = await withTransaction((session) =>
      MovieDomain.holdSeat(movieId, showId, seats, req.user._id, session),
    );
    emitToShow(movieId, showId, "seat:held", { seats: ticket.bookingSeats });

    res.status(200).json({
      message: "Seat held successfully",
      success: true,
      seats: ticket,
    });
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

async function bookSeat(req, res) {
  try {
    const movieId = req.params.id;
    const showId = req.params.showId;
    const seats = req.body.seatNumber;
    const ticket = await withTransaction((session) =>
      MovieDomain.bookSeat(movieId, showId, seats, req.user._id, session),
    );
    emitToShow(movieId, showId, "seat:booked", { seats: ticket.bookingSeats });

    res.status(200).json({
      message: "Seat booked successfully",
      success: true,
      booking: {
        movieId,
        showId,
        seats: ticket.bookingSeats,
        totalPrice: ticket.totalPrice,
        status: BOOKING_STATUS.CONFIRMED,
        qr: ticket.qr,
      },
    });
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

module.exports = {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  movieByDate,
  checkMovieShows,
  checkMovieShow,
  holdSeats,
  bookSeat,
};

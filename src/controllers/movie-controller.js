const MovieDomain = require("../services/movie-domain");
const { BOOKING_STATUS } = require("../Constants");
const { emitToShow } = require("../socket/socketManager");
const { withTransaction } = require("../utils/withTransaction");
const asyncHandler = require("../utils/asyncHandler");
const PaymentService = require("../services/payment-service");

const createMovie = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.poster = req.file.path;
  }
  const listing = await MovieDomain.create(req.body, req.user._id);
  await MovieDomain.pushMovieToAdmin(req.user._id, listing._id);
  res.status(201).json({ message: "Movie added", success: true });
});

const getAllMovies = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const movie = await MovieDomain.allMovies(limit, skip);
  res.status(200).send(movie);
});

const updateMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.file) {
    req.body.poster = req.file.path;
  }
  await MovieDomain.updateMovie(id, req.user._id, req.body);

  res.json({ message: "Movie Updated", success: true });
});

const deleteMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await withTransaction((session) =>
    MovieDomain.deleteMovie(id, req.user._id, session),
  );
  res.json({ message: "Movie Deleted", success: true });
});

const movieByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const shows = await MovieDomain.checkMovieByDate(date);
  res.status(200).send(shows);
});

const checkMovieShows = asyncHandler(async (req, res) => {
  const movieId = req.params.id;

  const movie = await MovieDomain.checkShows(movieId);
  res.status(200).json({ message: "Success", success: true, shows: movie });
});

const checkMovieShow = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const showId = req.params.showId;
  const movie = await MovieDomain.checkShow(movieId, showId);
  res.status(200).json({ message: "Success", success: true, show: movie });
});

const holdSeats = asyncHandler(async (req, res) => {
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
});

const bookSeat = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const showId = req.params.showId;
  const seats = req.body.seatNumber;
  const ticket = await withTransaction((session) =>
    MovieDomain.bookSeat(movieId, showId, seats, req.user._id, session),
  );
  emitToShow(movieId, showId, "seat:booked", { seats: ticket.bookingSeats });

  //sql payment
  let payment = null;
  try {
    payment = await PaymentService.recordSuccessfulPayment({
      bookingId: ticket.bookingId,
      userId: req.user._id,
      userName: ticket.userName,
      amount: ticket.totalPrice,
    });
  } catch (err) {
    console.error("Failed to record payment for booking", {
      bookingId: ticket.bookingId?.toString(),
      error: err.message,
    });
  }

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
    payment: payment
      ? {
          paymentUuid: payment.paymentUuid,
          status: "SUCCESS",
        }
      : { status: "PENDING_RECORD" },
  });
});

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

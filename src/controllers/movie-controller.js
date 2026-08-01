const MovieDomain = require("../services/movie-service");
const { BOOKING_STATUS } = require("../Constants");
const { emitToShow } = require("../socket/socketManager");
const { withTransaction } = require("../utils/withTransaction");
const asyncHandler = require("../utils/asyncHandler");
const PaymentService = require("../services/payment-service");
const redisClient = require("../config/redisio");
const { getCache, setCache, deleteCache } = require("../utils/cache");

const createMovie = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.poster = req.file.path;
  }
  await withTransaction((session) =>
    MovieDomain.createWithTransaction(req.body, req.user._id, session),
  );
  res.status(201).json({ message: "Movie added successfully", success: true });
});

const getAllMovies = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const cacheKey = `movies:page:${page}:limit:${limit}`;

  const cacheMovies = await getCache(cacheKey);

  if (cacheMovies) {
    return res.status(200).send(cacheMovies);
  }

  const movie = await MovieDomain.allMovies(limit, skip);
  await setCache(cacheKey, movie);

  res.status(200).send(movie);
});

const updateMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.file) {
    req.body.poster = req.file.path;
  }
  await MovieDomain.updateMovie(id, req.user._id, req.body);

  res.json({ message: "Movie Updated successfully", success: true });
});

const deleteMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await withTransaction((session) =>
    MovieDomain.deleteMovie(id, req.user._id, session),
  );
  res.json({ message: "Movie Deleted successfully", success: true });
});

const movieByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const cacheS = `movies:date:${date}`;
  const cacheMovies = await getCache(cacheS);
  if (cacheMovies) {
    return res.status(200).send(cacheMovies);
  }
  const shows = await MovieDomain.checkMovieByDate(date);
  await setCache(cacheS, shows);
  res.status(200).send(shows);
});

const checkMovieShows = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const cacheKey = `movies:${movieId}:shows`;

  const cacheShows = await getCache(cacheKey);
  if (cacheShows) {
    return res.status(200).json({
      message: "Success",
      success: true,
      shows: cacheShows,
    });
  }
  const movie = await MovieDomain.checkShows(movieId);
  await setCache(cacheKey, movie);

  res.status(200).json({ message: "Success", success: true, shows: movie });
});

const checkMovieShow = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const showId = req.params.showId;
  const cacheKey = `movies:${movieId}:show${showId}`;

  const checkShow = await getCache(cacheKey);
  if (checkShow) {
    return res.status(200).json({
      message: "Success",
      success: true,
      show: checkShow,
    });
  }
  const movie = await MovieDomain.checkShow(movieId, showId);
  await setCache(cacheKey, movie);
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
  await deleteCache(
    `movies:${movieId}:show${showId}`,
    `movies:${movieId}:shows`,
  );

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
  await deleteCache(
    `movies:${movieId}:show${showId}`,
    `movies:${movieId}:shows`,
  );

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

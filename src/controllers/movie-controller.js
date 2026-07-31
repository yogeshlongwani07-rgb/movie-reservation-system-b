const MovieDomain = require("../services/movie-service");
const { BOOKING_STATUS } = require("../Constants");
const { emitToShow } = require("../socket/socketManager");
const { withTransaction } = require("../utils/withTransaction");
const asyncHandler = require("../utils/asyncHandler");
const PaymentService = require("../services/payment-service");
const {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} = require("../utils/cache");

const createMovie = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.poster = req.file.path;
  }
  await withTransaction((session) =>
    MovieDomain.createWithTransaction(req.body, req.user._id, session),
  );
  await deleteCacheByPattern("movies:*");
  await deleteCache(`admin:movies:${req.user._id}`);
  res.status(201).json({ message: "Movie added successfully", success: true });
});

const getAllMovies = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const cacheKey = `movies:page:${page}:limit:${limit}`;
  const cachedMovies = await getCache(cacheKey);

  if (cachedMovies) {
    return res.status(200).send(cachedMovies);
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
  await deleteCacheByPattern("movies:*");
  await deleteCache(`admin:movies:${req.user._id}`);

  res.json({ message: "Movie Updated successfully", success: true });
});

const deleteMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await withTransaction((session) =>
    MovieDomain.deleteMovie(id, req.user._id, session),
  );
  await deleteCacheByPattern("movies:*");
  await deleteCache(`admin:movies:${req.user._id}`);
  res.json({ message: "Movie Deleted successfully", success: true });
});

const movieByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const cacheKey = `movies:date:${date}`;
  const cachedShows = await getCache(cacheKey);

  if (cachedShows) {
    return res.status(200).send(cachedShows);
  }

  const shows = await MovieDomain.checkMovieByDate(date);
  await setCache(cacheKey, shows);
  res.status(200).send(shows);
});

const checkMovieShows = asyncHandler(async (req, res) => {
  const movieId = req.params.id;

  const cacheKey = `movies:${movieId}:shows`;
  const cachedShows = await getCache(cacheKey);
  if (cachedShows) {
    return res.status(200).json({
      message: "Success",
      success: true,
      shows: cachedShows,
    });
  }
  const movie = await MovieDomain.checkShows(movieId);
  await setCache(cacheKey, movie, 30);

  res.status(200).json({ message: "Success", success: true, shows: movie });
});

const checkMovieShow = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const showId = req.params.showId;
  const cacheKey = `movies:${movieId}:shows:${showId}`;
  const cachedShow = await getCache(cacheKey);

  if (cachedShow) {
    return res
      .status(200)
      .json({ message: "Success", success: true, show: cachedShow });
  }

  const movie = await MovieDomain.checkShow(movieId, showId);
  await setCache(cacheKey, movie, 30);
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
    `movies:${movieId}:shows`,
    `movies:${movieId}:shows:${showId}`,
    `user:bookings:${req.user._id}`,
  );
  await deleteCacheByPattern("movies:date:*");

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
    `movies:${movieId}:shows`,
    `movies:${movieId}:shows:${showId}`,
    `user:bookings:${req.user._id}`,
  );
  await deleteCacheByPattern("movies:date:*");

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

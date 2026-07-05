const express = require("express");
const router = express.Router();
const { isLoggedIn, isUser, isAdmin } = require("../middleware/auth");
const {
  createMovieSchema,
  updateMovieSchema,
  bookShowSchema,
  movieIdParamsSchema,
  dateQuerySchema,
  holdOrBookSeatsSchema,
  movieIdWithShowIdParamsSchema,
} = require("../validations/movie.validation");
const validate = require("../middleware/validate");
const {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  movieByDate,
  createBooking,
  checkMovieShows,
  checkMovieShow,
  holdSeats,
  bookSeat,
} = require("../controllers/movie-controller");

//Movies CRUD
router.get("/", getAllMovies);
router.post(
  "/create",
  isLoggedIn,
  isAdmin,
  validate(createMovieSchema),
  createMovie,
);
router.put(
  "/update/:id",

  isLoggedIn,
  isAdmin,
  validate(movieIdParamsSchema, "params"),
  validate(updateMovieSchema),
  updateMovie,
);
router.delete(
  "/delete/:id",
  isLoggedIn,
  isAdmin,
  validate(movieIdParamsSchema, "params"),
  deleteMovie,
);

//Movies Details
router.get(
  "/available-shows",
  isLoggedIn,
  validate(dateQuerySchema, "query"),
  movieByDate,
);

router.get(
  "/shows/:id",
  isLoggedIn,
  isUser,
  validate(movieIdParamsSchema, "params"),
  checkMovieShows,
);

router.get(
  "/:id/show/:showId",
  isLoggedIn,
  isUser,
  validate(movieIdWithShowIdParamsSchema, "params"),

  checkMovieShow,
);

router.post(
  "/book-show",
  isLoggedIn,
  isUser,
  validate(bookShowSchema),
  createBooking,
);

router.post(
  "/:id/show/:showId/hold",
  isLoggedIn,
  isUser,
  validate(movieIdWithShowIdParamsSchema, "params"),
  validate(holdOrBookSeatsSchema),
  holdSeats,
);
router.post(
  "/:id/show/:showId/book",
  isLoggedIn,
  isUser,
  validate(movieIdWithShowIdParamsSchema, "params"),
  validate(holdOrBookSeatsSchema),
  bookSeat,
);

module.exports = router;

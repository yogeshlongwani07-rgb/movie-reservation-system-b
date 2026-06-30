const express = require("express");
const router = express.Router();
const { isLoggedIn, isUser, isAdmin } = require("../middleware/auth");
const {
  createMovieSchema,
  updateMovieSchema,
  bookShowSchema,
  movieIdParamsSchema,
  dateQuerySchema,
} = require("../validations/movie.validation");
const validate = require("../middleware/validate");
const {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  getAvailableShows,
  createBooking,
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
  getAvailableShows,
);

router.post(
  "/book-show",
  isLoggedIn,
  isUser,
  validate(bookShowSchema),
  createBooking,
);
module.exports = router;

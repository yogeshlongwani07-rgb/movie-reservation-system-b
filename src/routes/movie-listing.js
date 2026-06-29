const express = require("express");
const router = express.Router();
const { isLoggedIn, isUser, isAdmin } = require("../middleware/auth");
const {
  createMovieListing,
  allMovies,
  updateMovieListing,
  deleteMovieListing,
  checkAvailableShows,
  bookMovieShow,
} = require("../controllers/movie-controller");

//Movies CRUD
router.get("/", allMovies);
router.post("/add", isLoggedIn, isAdmin, createMovieListing);
router.put("/edit/:id", isLoggedIn, isAdmin, updateMovieListing);
router.delete("/delete/:id", isLoggedIn, isAdmin, deleteMovieListing);

//Movies Details
router.get("/shows", isLoggedIn, checkAvailableShows);
router.post("/bookings", isLoggedIn, isUser, bookMovieShow);
module.exports = router;

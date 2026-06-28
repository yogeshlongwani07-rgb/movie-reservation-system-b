const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin-perform-auth");
const { isUser } = require("../middleware/user-auth");
const {
  createMovieListing,
  allMovies,
  updateMovieListing,
  deleteMovieListing,
  checkAvailableShows,
  bookMovieShow,
  getMovieOwner,
} = require("../controllers/movie-controller");

//Movies CRUD
router.get("/", allMovies);
router.post("/add", isLoggedIn, isAdmin, createMovieListing);
router.put("/edit/:id", isLoggedIn, isAdmin, updateMovieListing);
router.delete("/delete/:id", isLoggedIn, isAdmin, deleteMovieListing);

//Movies Details
router.get("/shows", isLoggedIn, checkAvailableShows);
router.post("/bookings", isLoggedIn, isUser, bookMovieShow);
router.get("/owner/:id", getMovieOwner);
module.exports = router;

const express = require("express");
const router = express.Router();
const { isLoggedIn, isUser, isAdmin } = require("../middleware/auth");
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
router.post("/create", isLoggedIn, isAdmin, createMovie);
router.put("/update/:id", isLoggedIn, isAdmin, updateMovie);
router.delete("/delete/:id", isLoggedIn, isAdmin, deleteMovie);

//Movies Details
router.get("/available-shows", isLoggedIn, getAvailableShows);
router.post("/book-show", isLoggedIn, isUser, createBooking);
module.exports = router;

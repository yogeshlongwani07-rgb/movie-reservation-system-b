const Movie = require("../models/movie-listing");
const { Admin, User } = require("../models/user-admin");

async function createMovieListing(req, res) {
  try {
    const listing = await Movie.create({
      ...req.body,
      createdBy: req.user._id,
    });
    await Admin.findByIdAndUpdate(req.user._id, {
      $push: { movies: listing._id },
    });
    res.status(201).json({ message: "Movie added", success: true });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "Unexpected Error", success: false });
  }
}

async function allMovies(req, res) {
  try {
    const movie = await Movie.find({});
    res.status(200).send(movie);
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "Unexpected Error", success: false });
  }
}

async function updateMovieListing(req, res) {
  try {
    const id = req.params.id;
    const movie = await Movie.findByIdAndUpdate(id);
    if (!movie)
      return res
        .status(404)
        .json({ message: "Movie not Found", success: false });

    if (movie.createdBy.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });

    Object.assign(movie, req.body);
    await movie.save();

    res.json({ message: "Movie Updated", success: true });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function deleteMovieListing(req, res) {
  try {
    const id = req.params.id;
        const movie = await Movie.findByIdAndDelete(id);
    if (movie.createdBy.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized", success: false });
    

    if (!movie)
      return res
        .status(404)
        .json({ message: "Movie not Found", success: false });

    res.json({ message: "Movie Deleted", success: true });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function checkAvailableShows(req, res) {
  try {
    const { date } = req.query;
    const shows = await Movie.aggregate([
      { $unwind: "$shows" },
      { $match: { "shows.date": date, "shows.availableSeats": { $gt: 0 } } },
      {
        $project: {
          title: 1,
          duration: 1,
          price: 1,
          rating: 1,
          shows: "$shows",
        },
      },
      { $sort: { "shows.showTime": 1 } },
    ]);
    res.status(200).send(shows);
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function bookMovieShow(req, res) {
  try {
    const { movieId, showId, seats } = req.body;
    let movie = await Movie.findById(movieId);
    if (!movie)
      return res
        .status(404)
        .json({ message: "Movie not Found", success: false });
    const show = movie.shows.id(showId);
    if (!show)
      return res
        .status(404)
        .json({ message: "Show not Found", success: false });
    if (!Number.isInteger(seats)) {
      return res.status(400).json({
        message: "Seats must be an Number",
        success: false,
      });
    }
    if (seats < 1 || seats > 10) {
      return res.status(400).json({
        message: "You can book between 1 and 10 seats only",
        success: false,
      });
    }
    if (show.availableSeats < seats)
      return res
        .status(400)
        .json({ message: "Not enough seats available", success: false });

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not Found", success: false });
    user.bookings.push({
      movie: movieId,
      status: "Confirmed",
      seats: seats,
      showId: showId,
    });
    show.availableSeats -= seats;
    await user.save();
    await movie.save();

    res.status(200).json({ message: "Show Booked", success: true });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

async function getMovieOwner(req, res) {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId).populate(
      "createdBy",
      "name email",
    );
    res.status(200).json({ owner: movie.createdBy });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Unexpected Error", success: false });
  }
}

module.exports = {
  createMovieListing,
  updateMovieListing,
  deleteMovieListing,
  allMovies,
  checkAvailableShows,
  bookMovieShow,
  getMovieOwner,
};

const AppError = require("../utils/appError");
const MovieRepository = require("../repositories/movie.repository");
const { BOOKING_STATUS, SEAT_STATUS } = require("../Constants");
const { generateSeats, getSeatsByNumbers } = require("../utils/seatGenerator");
const { releaseExpiredLocks } = require("../utils/releaseExpiredLocks");
const QRCode = require("qrcode");
const crypto = require("crypto");

class MovieDomain {
  async create(body, userId) {
    if (!body.shows || !Array.isArray(body.shows)) {
      throw new AppError("Atleast one Show required in correct format", 400);
    }

    const newBody = {
      ...body,
      shows: body.shows?.map((show) => {
        const seats = generateSeats(
          show.layout?.rows || 10,
          show.layout?.columns || 15,
        );

        return {
          ...show,
          seats,
          totalSeats: seats.length,
          availableSeats: seats.length,
          occupiedSeats: 0,
          lockedSeats: 0,
        };
      }),
    };

    const listing = await MovieRepository.create({
      ...newBody,
      createdBy: userId,
    });
    return listing;
  }
  async pushMovieToAdmin(userId, movieId) {
    await MovieRepository.findByIdAndUpdate(userId, movieId);
  }
  async allMovies(limit, skip) {
    const movie = await MovieRepository.findMovies(limit, skip);
    return movie;
  }

  async updateMovie(id, userId, body) {
    let movie = await MovieRepository.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== userId.toString()) {
      throw new AppError("You are not authorized", 403);
    }

    Object.assign(movie, body);
    await MovieRepository.save(movie);
    return movie;
  }

  async deleteMovie(id, userId, session) {
    const stringUserId = userId.toString();
    const movie = await MovieRepository.findByIdWithSession(id, session);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    if (movie.createdBy.toString() !== stringUserId) {
      throw new AppError("You are not authorized", 403);
    }

    const admin = await MovieRepository.findByIdWithSessionAndAdmin(
      stringUserId,
      session,
    );

    if (!admin) {
      throw new AppError("Admin not Found", 404);
    }
    admin.movies = admin.movies.filter((movie) => {
      return movie.toString() !== id;
    });

    await MovieRepository.saveWithSession(admin, session);
    await MovieRepository.deleteOne(movie, session);
    return movie;
  }

  async checkMovieByDate(date) {
    const shows = await MovieRepository.checkMovieByDate(date);
    return shows;
  }
  async checkShows(id) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    for (const show of movie.shows) {
      await releaseExpiredLocks(show);
    }
    await MovieRepository.save(movie);
    return movie.shows;
  }
  async checkShow(id, showId) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    const show = movie.shows.find((s) => s._id.toString() === showId);
    if (!show) {
      throw new AppError("Show not Found", 404);
    }
    await releaseExpiredLocks(show);
    await MovieRepository.save(movie);
    return show;
  }

  async holdSeat(movieId, showId, seats, userId, session) {
    const movie = await MovieRepository.findByIdWithSession(movieId, session);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }
    const show = movie.shows.id(showId);
    if (!show) {
      throw new AppError("Show not Found", 404);
    }
    await releaseExpiredLocks(show);

    if (!Array.isArray(seats) || seats.length === 0) {
      throw new AppError("At least one seat is required", 400);
    }

    const user = await MovieRepository.findByIdWithSessionAndUser(
      userId,
      session,
    );
    if (!user) {
      throw new AppError("User not Found", 404);
    }
    const existingHold = user.bookings.find(
      (booking) =>
        booking.showId.toString() === showId.toString() &&
        booking.status === BOOKING_STATUS.HOLD,
    );

    if (existingHold) {
      throw new AppError("You already have an active hold for this show.", 400);
    }

    if (show.availableSeats < seats.length) {
      throw new AppError("Not enough seats available", 400);
    }

    const seatToBook = getSeatsByNumbers(show, seats);

    if (seatToBook.length !== seats.length) {
      throw new AppError("Some seats not found", 404);
    }

    const unavailableSeats = seatToBook.filter(
      (seat) => seat.status !== SEAT_STATUS.AVAILABLE,
    );
    if (unavailableSeats.length > 0) {
      throw new AppError(
        `Seats ${unavailableSeats.map((s) => s.seatNumber).join(", ")} are not available`,
        400,
      );
    }
    let totalPrice = 0;
    const bookingSeats = [];

    seatToBook.forEach((seat) => {
      const seatPrice = movie.price * seat.priceMultiplier;
      totalPrice += seatPrice;
      seat.status = SEAT_STATUS.LOCKED;
      seat.lockedBy = userId;
      seat.lockedExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      bookingSeats.push({
        seatId: seat._id,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        price: seatPrice,
      });
    });
    user.bookings.push({
      movie: movieId,
      status: BOOKING_STATUS.HOLD,
      seats: bookingSeats,
      holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      showId: showId,
      totalPrice,
    });

    show.availableSeats -= seats.length;
    show.lockedSeats += seatToBook.length;
    await MovieRepository.saveWithSession(user, session);
    await MovieRepository.saveWithSession(movie, session);
    return {
      bookingSeats: bookingSeats,
      totalPrice: totalPrice,
    };
  }

  async bookSeat(movieId, showId, seats, userId, session) {
    const movie = await MovieRepository.findByIdWithSession(movieId, session);
    if (!movie) {
      throw new AppError("Movie not Found", 404);
    }

    const show = movie.shows.id(showId);
    if (!show) {
      throw new AppError("Show not Found", 404);
    }

    await releaseExpiredLocks(show);

    if (!Array.isArray(seats) || seats.length === 0) {
      throw new AppError("At least one seat is required", 400);
    }
    const user = await MovieRepository.findByIdWithSessionAndUser(
      userId,
      session,
    );
    if (!user) {
      throw new AppError("User not Found", 404);
    }

    const existingHold = user.bookings.find(
      (booking) =>
        booking.showId.toString() === showId.toString() &&
        booking.status === BOOKING_STATUS.HOLD &&
        booking.seats.length === seats.length &&
        seats.every((seatNumber) =>
          booking.seats.some((seat) => seat.seatNumber === seatNumber),
        ),
    );
    if (!existingHold) {
      throw new AppError("No matching active hold found for these seats", 400);
    }
    const seatToBook = getSeatsByNumbers(show, seats);
    if (seatToBook.length !== seats.length) {
      throw new AppError("Some seats not found", 404);
    }

    const unavailableSeats = seatToBook.filter(
      (seat) =>
        seat.status !== SEAT_STATUS.LOCKED ||
        !seat.lockedBy?.equals(userId) ||
        !seat.lockedExpires ||
        seat.lockedExpires <= new Date(),
    );
    if (unavailableSeats.length > 0) {
      throw new AppError(
        `Seats ${unavailableSeats.map((s) => s.seatNumber).join(", ")} are not held by you`,
        400,
      );
    }

    seatToBook.forEach((seat) => {
      seat.status = SEAT_STATUS.BOOKED;
      seat.lockedBy = null;
      seat.lockedExpires = null;
    });

    const randomId = crypto.randomUUID();

    const qrData = {
      userId,
      movieId,
      showId,
      randomId,
    };

    const qr = await QRCode.toDataURL(JSON.stringify(qrData));
    existingHold.status = BOOKING_STATUS.CONFIRMED;
    existingHold.bookedAt = new Date();
    existingHold.tickettoken = qr;

    show.lockedSeats -= seatToBook.length;
    show.occupiedSeats += seatToBook.length;

    await MovieRepository.saveWithSession(user, session);
    await MovieRepository.saveWithSession(movie, session);

    return {
      bookingId: existingHold._id,
      userName: user.name,
      bookingSeats: existingHold.seats,
      totalPrice: existingHold.totalPrice,
      qr,
    };
  }
}

module.exports = new MovieDomain();

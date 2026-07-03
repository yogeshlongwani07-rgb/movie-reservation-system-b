const { required, string } = require("joi");
const mongoose = require("mongoose");
const { SEAT_TYPES, SEAT_STATUS, SEAT_PRICING } = require("../Constants");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
    column: {
      type: Number,
      required: true,
    },
    seatType: {
      type: String,
      enum: Object.values(SEAT_TYPES),
      default: SEAT_TYPES.STANDARD,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
      required: true,
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
      required: true,
    },
  },
  { _id: true },
);

const showSchema = new mongoose.Schema({
  showTime: {
    type: String, // "23:00"
    required: true,
  },
  date: {
    type: String, // "2026-06-25"
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: [1, "Total seats must be at least 1"],
  },
  screen: {
    type: String,
    required: true,
  },
  layout: {
    rows: {
      type: Number,
      required: true,
      min: [1, "At least 1 row required"],
    },
    columns: {
      type: Number,
      required: true,
      min: [1, "At least 1 column required"],
    },
  },
  seats: [seatSchema],
  availableSeats: {
    type: Number,
    required: true,
    min: [0, "Available seats cannot be negative"],
  },
  occupiedSeats: {
    type: Number,
    default: 0,
  },
  lockedSeats: {
    type: Number,
    default: 0,
  },
});

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "Hindi",
    },
    duration: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [10, "Rating cannot be more than 10"],
    },
    price: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    shows: [showSchema],
  },
  { timestamps: true },
);

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;

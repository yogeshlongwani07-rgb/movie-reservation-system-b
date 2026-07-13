const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../Constants");

const bookingSeatsSchema = new mongoose.Schema(
  {
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    seatType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: true },
);
const bookingSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    seats: [bookingSeatsSchema],
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    tickettoken: {
      type: String,
      unique: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },

    providerId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    avatar: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1WcuoYVVzU1rIinX3_Upr2zYnT55OcSkygN_xIWEatPqf2J7IefRMfBJL&s=10",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    bookings: [bookingSchema],
  },
  {
    timestamps: true,
  },
);

userSchema.index({
  email: 1,
});

const User = mongoose.model("User", userSchema);

module.exports = User;

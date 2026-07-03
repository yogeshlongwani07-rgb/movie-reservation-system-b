const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../Constants");

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
      required: true,
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
    bookings: [
      {
        movie: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Movie",
          required: true,
        },
        seats: {
          type: Number,
          required: true,
        },
        showId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        status: {
          type: String,
          enum: Object.values(BOOKING_STATUS),
          default: BOOKING_STATUS.CONFIRMED,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;

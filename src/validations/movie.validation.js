const Joi = require("joi");
const showSchema = Joi.object({
  showTime: Joi.string().required(),
  date: Joi.string().required(), // later change to date()
  layout: Joi.object({
    rows: Joi.number().integer().min(1).required(),
    columns: Joi.number().integer().min(1).required(),
  }).required(),
  totalSeats: Joi.number().integer().min(0).required(),
  availableSeats: Joi.number().integer().min(0).required(),
  screen: Joi.string().optional(),
});

const createMovieSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  language: Joi.string().trim().optional(),
  duration: Joi.number().integer().positive().required(),
  rating: Joi.number().min(0).max(10).optional(),
  price: Joi.number().positive().required(),
  shows: Joi.array().items(showSchema).optional(),
});

const updateMovieSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  language: Joi.string().trim().optional(),
  duration: Joi.number().integer().positive().optional(),
  rating: Joi.number().min(0).max(10).optional(),
  price: Joi.number().positive().optional(),
  shows: Joi.array().items(showSchema).optional(),
}).min(1);

const bookShowSchema = Joi.object({
  movieId: Joi.string().hex().length(24).required(),
  showId: Joi.string().hex().length(24).required(),
  seats: Joi.array().items(Joi.string().required()).min(1).required(),
});

const movieIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const dateQuerySchema = Joi.object({
  date: Joi.string().required(),
});

module.exports = {
  createMovieSchema,
  updateMovieSchema,
  bookShowSchema,
  movieIdParamsSchema,
  dateQuerySchema,
};

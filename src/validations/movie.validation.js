const Joi = require("joi");
const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const seatNumberRegex = /^[A-Z]+[1-9]\d*$/;

const showSchema = Joi.object({
  showTime: Joi.string().pattern(timeRegex).required(),
  date: Joi.string().pattern(dateRegex).required(),
  layout: Joi.object({
    rows: Joi.number().integer().min(1).required(),
    columns: Joi.number().integer().min(1).required(),
  }).required(),
  screen: Joi.string().optional(),
});

const createMovieSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  language: Joi.string().trim().optional(),
  duration: Joi.number().integer().positive().required(),
  poster: Joi.string().optional(),
  trailer: Joi.string().optional(),
  rating: Joi.number().min(0).max(10).optional(),
  price: Joi.number().positive().required(),
  shows: Joi.array().items(showSchema).min(1).required(),
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

const seatNumbersSchema = Joi.array()
  .items(Joi.string().trim().uppercase().pattern(seatNumberRegex).required())
  .unique()
  .min(1)
  .required();

const holdOrBookSeatsSchema = Joi.object({
  seatNumber: seatNumbersSchema,
});
const movieIdParamsSchema = Joi.object({
  id: Joi.string().pattern(objectIdRegex).required(),
});

const movieIdWithShowIdParamsSchema = Joi.object({
  id: Joi.string().pattern(objectIdRegex).required(),
  showId: Joi.string().pattern(objectIdRegex).required(),
});

const dateQuerySchema = Joi.object({
  date: Joi.string().pattern(dateRegex).required(),
});

const movieListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(5),
});

module.exports = {
  createMovieSchema,
  updateMovieSchema,
  movieIdParamsSchema,
  dateQuerySchema,
  movieListQuerySchema,
  holdOrBookSeatsSchema,
  movieIdWithShowIdParamsSchema,
};

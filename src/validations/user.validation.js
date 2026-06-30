const Joi = require("joi");

const registerUserSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
});

const loginUserSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const bookingCancelParamsSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  bookingCancelParamsSchema,
};

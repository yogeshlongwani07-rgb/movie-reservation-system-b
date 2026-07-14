const Joi = require("joi");

const bookingIdParamsSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
});

module.exports = { bookingIdParamsSchema };

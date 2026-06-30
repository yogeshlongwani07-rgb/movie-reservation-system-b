const Joi = require("joi");

const registerAdminSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin").required(),
  passkey: Joi.string().required(),
});

const loginAdminSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerAdminSchema, loginAdminSchema };

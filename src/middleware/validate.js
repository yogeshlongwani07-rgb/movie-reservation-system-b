const AppError = require("../utils/appError");

function validate(schema, property = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const msg = error.details.map(({ message }) => message);
      return next(new AppError(msg, 400));
    }

    req[property] = value;
    next();
  };
}

module.exports = validate;

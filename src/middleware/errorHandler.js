const AppError = require("../utils/appError");

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: err.details?.map((d) => d.message) || "Validation error",
    });
  }

  console.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: "Unexpected Error",
  });
}

module.exports = errorHandler;

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `${duplicateField} already exists`,
    });
  }

  if (error?.name === "ValidationError") {
    const firstError = Object.values(error.errors || {})[0];
    return res.status(400).json({
      message: firstError?.message || "Validation failed",
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Internal server error",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

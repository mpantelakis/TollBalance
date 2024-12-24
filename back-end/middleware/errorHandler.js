const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "failed",
    info: err.message,
  });
};

module.exports = errorHandler;

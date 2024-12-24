const jwt = require("jsonwebtoken");
const CustomError = require("../errors/customErrors");
const AsyncHandler = require("express-async-handler");

// Middleware to authenticate the user using JWT token
const authenticateUser = AsyncHandler(async (req, res, next) => {
  // Get the token from the request headers (x-observatory-auth)
  const token = req.headers["x-observatory-auth"];

  // If no token is provided, throw a NotAuthorized error
  if (!token) {
    throw new CustomError.NotAuthorized("No token provided");
  }

  // Verify the token using the JWT secret from environment variables
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    // If the token is invalid or expired, throw a NotAuthorized error
    if (err) {
      throw new CustomError.NotAuthorized("Invalid or expired token");
    }
  });

  // Proceed to the next middleware or route handler if the token is valid
  next();
});

// Export the middleware function for use in other files
module.exports = authenticateUser;

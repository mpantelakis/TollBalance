const jwt = require("jsonwebtoken");
const CustomError = require("../errors/customErrors");
const AsyncHandler = require("express-async-handler");

const authenticateUser = AsyncHandler(async (req, res, next) => {
  const token = req.headers["x-observatory-auth"];

  if (!token) {
    throw new CustomError.NotAuthorized("No token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      throw new CustomError.NotAuthorized("Invalid or expired token");
    }
    return decoded;
  });

  req.user = decoded;
  console.log(req.user);

  next();
});

module.exports = authenticateUser;

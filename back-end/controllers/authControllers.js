const jwt = require("jsonwebtoken");
const pool = require("../db");

const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

// Login user function
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  // Check if both username and password are provided
  if (!username || !password) {
    throw new CustomError.BadRequest("Username and password are required");
  }

  // Query the database to find the user by username
  const [user] = await pool.execute(
    "SELECT id,username,password FROM operators WHERE username = ?",
    [username]
  );

  // If the user is not found, return an error
  if (user.length === 0) {
    throw new CustomError.NotAuthorized("Invalid credentials");
  }

  // Check if the provided password matches the stored password
  const isMatch = password == user[0].password;
  if (!isMatch) {
    throw new CustomError.NotAuthorized("Invalid credentials");
  }

  // Generate a JWT token with the user's id and username as the payload
  const token = jwt.sign(
    { id: user[0].id, username: user[0].username },
    process.env.JWT_SECRET, // Secret key for JWT signing
    {
      expiresIn: "2h", // Token expires in 2 hours
    }
  );

  // Send the token in the response
  res.json({ token });
});

// Logout user function (just sends a 200 response to confirm logout)
const logoutUser = (req, res) => {
  res.status(200).send(); // Logout confirmed by sending a status 200 response
};

// Exporting login and logout functions for use in other parts of the application
module.exports = { loginUser, logoutUser };

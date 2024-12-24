const jwt = require("jsonwebtoken");
const pool = require("../db");

const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new CustomError.BadRequest("Username and password are required");
  }

  const [user] = await pool.execute(
    "SELECT id,username,password FROM operators WHERE username = ?",
    [username]
  );

  if (user.length === 0) {
    throw new CustomError.NotAuthorized("Invalid credentials");
  }

  const isMatch = password == user[0].password;
  if (!isMatch) {
    throw new CustomError.NotAuthorized("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user[0].id, username: user[0].username },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  res.json({ token });
});

const logoutUser = (req, res) => {
  res.status(200).send();
};

module.exports = logoutUser;

module.exports = { loginUser, logoutUser };

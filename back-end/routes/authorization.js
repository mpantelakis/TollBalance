const { Router } = require("express");
const { loginUser, logoutUser } = require("../controllers/authControllers");
const authenticateUser = require("../middleware/userAuthentication");

const authRouter = Router();

authRouter.post("/login", loginUser);
authRouter.post("/logout", authenticateUser, logoutUser);

module.exports = authRouter;

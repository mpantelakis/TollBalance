const { Router } = require("express");
const {
    NotSettled,
    NotVerified
} = require("../controllers/restControllers");
const authenticateUser = require("../middleware/userAuthentication");

const restRouter = Router();

restRouter.get("/notsettled", authenticateUser, NotSettled);
restRouter.get("/notverified", authenticateUser, NotVerified);
//restRouter.get("/settle", authenticateUser, Settle);
//restRouter.get("/verify", authenticateUser, Verify);

module.exports = restRouter;

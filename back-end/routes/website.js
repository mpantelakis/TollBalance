const { Router } = require("express");
const {
    NotSettled,
    NotVerified
} = require("../controllers/websiteControllers");
const authenticateUser = require("../middleware/userAuthentication");

const websiteRouter = Router();

websiteRouter.get("/notsettled", authenticateUser, NotSettled);
websiteRouter.get("/notverified", authenticateUser, NotVerified);
//restRouter.get("/settle", authenticateUser, Settle);
//restRouter.get("/verify", authenticateUser, Verify);

module.exports = websiteRouter;

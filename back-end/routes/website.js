const { Router } = require("express");
const {
    NotSettled,
    TotalNotSettled,
    NotVerified, 
    TotalNotVerified,
    SettleDebt
} = require("../controllers/websiteControllers");
const authenticateUser = require("../middleware/userAuthentication");

const websiteRouter = Router();

websiteRouter.get("/notsettled", authenticateUser, NotSettled);
websiteRouter.get("/totalnotsettled", authenticateUser, TotalNotSettled);
websiteRouter.get("/notverified", authenticateUser, NotVerified);
websiteRouter.get("/totalnotverified", authenticateUser, TotalNotVerified);
websiteRouter.post("/settledebt/:creditorId", authenticateUser, SettleDebt);
//restRouter.get("/verify", authenticateUser, Verify);

module.exports = websiteRouter;

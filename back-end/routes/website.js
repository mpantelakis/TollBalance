const { Router } = require("express");
const {
    NotSettled,
    TotalNotSettled,
    NotVerified, 
    TotalNotVerified,
    SettleDebt,
    VerifyPayment
} = require("../controllers/websiteControllers");
const authenticateUser = require("../middleware/userAuthentication");

const websiteRouter = Router();

websiteRouter.get("/notsettled/:id", authenticateUser, NotSettled);
websiteRouter.get("/totalnotsettled/:id", authenticateUser, TotalNotSettled);
websiteRouter.get("/notverified/:id", authenticateUser, NotVerified);
websiteRouter.get("/totalnotverified/:id", authenticateUser, TotalNotVerified);
websiteRouter.post("/settledebt/:debtorId/:creditorId", authenticateUser, SettleDebt);
websiteRouter.post("/verifypayment/:creditorId/:debtorId", authenticateUser, VerifyPayment);

module.exports = websiteRouter;

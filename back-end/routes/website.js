const { Router } = require("express");
const {
    NotSettled,
    TotalNotSettled,
    NotVerified, 
    TotalNotVerified,
    SettleDebt,
    VerifyPayment,
    HistoryDebt,
    TrafficVariation,
    RoadsPerOperator,
    TrafficVariationPerRoad,
    TrafficDistribution,
    MostPopularTollBooths,
    OtherOperators,
    DebtHistoryChart,
    OwedAmountsChart,
    RevenueDistribution
} = require("../controllers/websiteControllers");
const authenticateUser = require("../middleware/userAuthentication");

const websiteRouter = Router();

websiteRouter.get("/notsettled/:id", authenticateUser, NotSettled);
websiteRouter.get("/totalnotsettled/:id", authenticateUser, TotalNotSettled);
websiteRouter.get("/notverified/:id", authenticateUser, NotVerified);
websiteRouter.get("/totalnotverified/:id", authenticateUser, TotalNotVerified);
websiteRouter.post("/settledebt/:debtorId/:creditorId", authenticateUser, SettleDebt);
websiteRouter.post("/verifypayment/:creditorId/:debtorId", authenticateUser, VerifyPayment);
websiteRouter.get("/historydebt/:debtorId/:creditorId", authenticateUser, HistoryDebt);
websiteRouter.get("/trafficvariation/:id/:date_from/:date_to", authenticateUser, TrafficVariation);
websiteRouter.get("/roadsperoperator/:id", authenticateUser, RoadsPerOperator);
websiteRouter.get("/trafficvariationperroad/:id/:road/:date_from/:date_to", authenticateUser, TrafficVariationPerRoad);
websiteRouter.get("/trafficdistribution/:id/:date_from/:date_to", authenticateUser, TrafficDistribution);
websiteRouter.get("/mostpopulartollbooths/:id", authenticateUser, MostPopularTollBooths);
websiteRouter.get("/otheroperators/:id", authenticateUser, OtherOperators);
websiteRouter.get("/debthistorychart/:debtorId/:creditorId/:date_from/:date_to", authenticateUser, DebtHistoryChart);
websiteRouter.get("/owedamountschart/:creditorId/:debtorId/:date_from/:date_to", authenticateUser, OwedAmountsChart);
websiteRouter.get("/revenuedistribution/:id/:date_from/:date_to", authenticateUser, RevenueDistribution);

module.exports = websiteRouter;

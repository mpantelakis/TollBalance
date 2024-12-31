const { Router } = require("express");
const {
  tollStationPasses,
  passAnalysis,
  passesCost,
  chargesBy,
} = require("../controllers/functionalControllers");
const authenticateUser = require("../middleware/userAuthentication");

const functionalRouter = Router();

functionalRouter.get(
  "/tollStationPasses/:tollStationID/:date_from/:date_to",
  authenticateUser,
  tollStationPasses
);
functionalRouter.get(
  "/passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to",
  authenticateUser,
  passAnalysis
);
functionalRouter.get(
  "/passesCost/:tollOpID/:tagOpID/:date_from/:date_to",
  authenticateUser,
  passesCost
);
functionalRouter.get(
  "/chargesBy/:tollOpID/:date_from/:date_to",
  authenticateUser,
  chargesBy
);

module.exports = functionalRouter;

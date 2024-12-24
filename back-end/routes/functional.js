const { Router } = require("express");
const {
  tollStationPasses,
  passAnalysis,
  passesCost,
  chargesBy,
} = require("../controllers/functionalControllers");

const functionalRouter = Router();

functionalRouter.get(
  "/tollStationPasses/:tollStationID/:date_from/:date_to",
  tollStationPasses
);
functionalRouter.get(
  "/passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to",
  passAnalysis
);
functionalRouter.get(
  "/passesCost/:tollOpID/:tagOpID/:date_from/:date_to",
  passesCost
);
functionalRouter.get("/chargesBy/:tollOpID/:date_from/:date_to", chargesBy);

module.exports = functionalRouter;

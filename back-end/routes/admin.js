const { Router } = require("express");
const { addPasses } = require("../controllers/adminControllers");
const { resetStations } = require("../controllers/adminControllers");
const { resetPasses } = require("../controllers/adminControllers");
const { healthCheck } = require("../controllers/adminControllers");
const multer = require("multer");

const upload = multer({ dest: "back-end/uploads/" });

const adminRouter = Router();

adminRouter.get("/healthcheck", healthCheck);
adminRouter.post("/resetstations", resetStations);
adminRouter.post("/resetpasses", resetPasses);
adminRouter.post("/addpasses", upload.single("csvFile"), addPasses);

module.exports = adminRouter;

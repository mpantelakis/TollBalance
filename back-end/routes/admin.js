const { Router } = require("express");
const {
  addPasses,
  resetStations,
  resetPasses,
  healthCheck,
  modifyUser,
  getUsers,
} = require("../controllers/adminControllers");

const authenticateAdmin = require("../middleware/adminAuthentication");

const multer = require("multer");

const upload = multer({ dest: "back-end/uploads/" });

const adminRouter = Router();

adminRouter.get("/healthcheck", authenticateAdmin, healthCheck);
adminRouter.post("/resetstations", authenticateAdmin, resetStations);
adminRouter.post("/resetpasses", authenticateAdmin, resetPasses);
adminRouter.post(
  "/addpasses",
  authenticateAdmin,
  upload.single("csvFile"),
  addPasses
);
adminRouter.post("/usermod", authenticateAdmin, modifyUser);
adminRouter.get("/users", authenticateAdmin, getUsers);

module.exports = adminRouter;

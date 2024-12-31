const { Router } = require("express");
const {
  addPasses,
  resetStations,
  resetPasses,
  healthCheck,
  modifyUser,
  getUsers,
} = require("../controllers/adminControllers");

const authenticateUser = require("../middleware/userAuthentication");

const multer = require("multer");

const upload = multer({ dest: "back-end/uploads/" });

const adminRouter = Router();

adminRouter.get("/healthcheck", healthCheck);
adminRouter.post("/resetstations", resetStations);
adminRouter.post("/resetpasses", resetPasses);
adminRouter.post(
  "/addpasses",
  authenticateUser,
  upload.single("csvFile"),
  addPasses
);
adminRouter.post("/usermod", authenticateUser, modifyUser);
adminRouter.get("/users", authenticateUser, getUsers);

module.exports = adminRouter;

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

const errorHandler = require("./middleware/errorHandler");

const adminRouter = require("./routes/admin");
const functionalRouter = require("./routes/functional");
const authRouter = require("./routes/authorization");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../front-end")));

app.use("/api/admin", adminRouter);
app.use("/api/", functionalRouter);
app.use("/api/", authRouter);

const PORT = 9115;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

app.use(errorHandler);

const express = require("express");
const app = express();

const errorHandler = require("./middleware/errorHandler");

const adminRouter = require("./routes/admin");
const functionalRouter = require("./routes/functional");

app.use(express.json());
app.use("/api/admin", adminRouter);
app.use("/api/", functionalRouter);

const PORT = 9115;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

app.use(errorHandler);

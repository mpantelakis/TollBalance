const express = require("express");
const app = express();

const errorHandler = require("./middleware/errorHandler");

const adminRouter = require("./routes/admin");

app.use(express.json());
app.use("/api/admin", adminRouter);

const PORT = 9115;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

app.use(errorHandler);

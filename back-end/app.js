const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");

// Import custom error handling middleware
const errorHandler = require("./middleware/errorHandler");

app.use(cors);

// Import route handlers
const adminRouter = require("./routes/admin");
const functionalRouter = require("./routes/functional");
const authRouter = require("./routes/authorization");

// Middleware to parse JSON data in request bodies
app.use(express.json());

// Middleware to parse URL-encoded data in request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., HTML, CSS, JS) from the front-end directory
app.use(express.static(path.join(__dirname, "../front-end")));

// Define routes for different API endpoints
app.use("/api/admin", adminRouter); // Admin-related routes
app.use("/api/", functionalRouter); // General functional routes
app.use("/api/", authRouter); // Authorization-related routes

// Define the port on which the app will listen
const PORT = 9115;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

// Error handler middleware to catch and handle any errors
app.use(errorHandler);

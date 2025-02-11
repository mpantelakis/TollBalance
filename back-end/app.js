require("dotenv").config(); // Load environment variables
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");
const fs = require("fs");
const https = require("https");

// Import custom error handling middleware
const errorHandler = require("./middleware/errorHandler");

// Load SSL certificate and key paths from .env
const sslKeyPath = process.env.SSL_KEY;
const sslCertPath = process.env.SSL_CERT;

if (!sslKeyPath || !sslCertPath) {
  console.error("Missing SSL key or certificate path in .env file");
  process.exit(1);
}

// Read SSL files
const options = {
  key: fs.readFileSync(path.resolve(__dirname, sslKeyPath)),
  cert: fs.readFileSync(path.resolve(__dirname, sslCertPath)),
};

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  })
);

// Import route handlers
const adminRouter = require("./routes/admin");
const functionalRouter = require("./routes/functional");
const authRouter = require("./routes/authorization");
const websiteRouter = require("./routes/website");

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
app.use("/api/", websiteRouter); // Rest functional routes

// Define the port on which the app will listen
const PORT = 9115;

// Start the HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});

// Error handler middleware to catch and handle any errors
app.use(errorHandler);

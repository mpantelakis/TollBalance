const fs = require("fs");
const Papa = require("papaparse");
const pool = require("../db");
const path = require("path");
const bcrypt = require("bcryptjs");
const { parse, format } = require("date-fns");

require("dotenv").config();

const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

// Health check function for verifying DB connection and counting records
const healthCheck = asyncHandler(async (req, res) => {
  const connectionString = `mysql://${process.env.DB_USER}:****@${process.env.DB_HOST}/${process.env.DB_NAME}`;

  try {
    // Query to count the number of toll stations
    const [[{ count: n_stations }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM toll_stations"
    );
    // Query to count the number of distinct tags (vehicle references)
    const [[{ count: n_tags }]] = await pool.query(
      "SELECT COUNT(DISTINCT tag_vehicle_ref_id) AS count FROM toll_passes;"
    );
    // Query to count the total number of toll passes
    const [[{ count: n_passes }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM toll_passes;"
    );

    // Return the health check status and counts of records
    res.status(200).json({
      status: "OK",
      dbconnection: connectionString,
      n_stations,
      n_tags,
      n_passes,
    });
  } catch (error) {
    // If there's an error, return failed status
    res.status(401).json({
      status: "failed",
      dbconnection: connectionString,
    });
  }
});

// Add toll passes from CSV file
const addPasses = asyncHandler(async (req, res, next) => {
  const csvFile = req.file;

  // Check if CSV file is provided
  if (!csvFile) {
    throw new CustomError.BadRequest("The CSV file is missing.");
  }

  // Check if the file is a valid CSV
  if (csvFile.mimetype !== "text/csv") {
    fs.unlinkSync(csvFile.path);
    throw new CustomError.BadRequest("The file is not a valid CSV file.");
  }

  const passes = [];

  // Process the CSV file and parse data
  await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(csvFile.path);
    let csvData = "";

    fileStream.on("data", (chunk) => {
      csvData += chunk; // Collect the CSV data chunk by chunk
    });

    fileStream.on("end", () => {
      try {
        // Parse the CSV data using PapaParse
        const parsedData = Papa.parse(csvData, {
          header: true, // Treat first row as headers
          skipEmptyLines: true, // Skip empty lines in CSV
        });

        if (parsedData.errors.length > 0) {
          throw new CustomError.InternalError(
            "Error while parsing the CSV file."
          );
        }

        // Push the parsed data into the passes array
        passes.push(...parsedData.data);

        fs.unlinkSync(csvFile.path); // Clean up the uploaded file
        resolve();
      } catch (err) {
        fs.unlinkSync(csvFile.path); // Clean up the file on error
        reject(
          new CustomError.InternalError("Error while processing the CSV file.")
        );
      }
    });

    fileStream.on("error", (err) => {
      fs.unlinkSync(csvFile.path); // Clean up the file on error
      reject(
        new CustomError.InternalError("Error while reading the CSV file.")
      );
    });
  });

  // If no data was found in the CSV file, throw an error
  if (passes.length === 0) {
    throw new CustomError.BadRequest("No data found in the CSV file.");
  }

  // Insert each pass into the database
  for (const pass of passes) {
    const { timestamp, tollID, tagHomeID, tagRef, charge } = pass;
    let parsedDate = parse(timestamp, "MM-dd-yy", new Date()); // Parse the timestamp
    let formattedDate = format(parsedDate, "yyyy-MM-dd"); // Format the date for DB

    // Insert the toll pass data into the database
    await pool.query(
      "INSERT INTO toll_passes (timestamp,toll_id,tag_operator_id,tag_vehicle_ref_id,charge) VALUES (?, ?, ?, ?,?)",
      [formattedDate, tollID, tagHomeID, tagRef, charge]
    );
  }

  res.status(200).json({ status: "OK" });
});

// Reset stations by loading data from a CSV file
const resetStations = asyncHandler(async (req, res) => {
  const filePath = path.join(__dirname, "../files/tollstations2024.csv");

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new CustomError.BadRequest(
      "The CSV file does not exist in the specified directory."
    );
  }

  const stations = [];

  // Process and parse the toll stations CSV
  await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    let csvData = "";

    fileStream.on("data", (chunk) => {
      csvData += chunk;
    });

    fileStream.on("end", () => {
      try {
        // Parse CSV data
        const parsedData = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
        });

        if (parsedData.errors.length > 0) {
          throw new CustomError.InternalError(
            "Error while parsing the CSV file."
          );
        }

        stations.push(...parsedData.data);
        resolve();
      } catch (err) {
        reject(
          new CustomError.InternalError("Error while processing the CSV file.")
        );
      }
    });

    fileStream.on("error", (err) => {
      reject(
        new CustomError.InternalError("Error while reading the CSV file.")
      );
    });
  });

  if (stations.length === 0) {
    throw new CustomError.BadRequest("No data found in the CSV file.");
  }

  // Check if any toll passes exist before truncating toll_stations
  const [passRows] = await pool.query(
    "SELECT COUNT(*) AS count FROM toll_passes"
  );

  if (passRows[0].count > 0) {
    throw new CustomError.BadRequest(
      "Cannot reset toll stations. Toll passes must be reset first."
    );
  }

  await pool.query("DELETE FROM toll_stations");

  for (const station of stations) {
    const {
      OpID,
      TollID,
      Name,
      PM,
      Locality,
      Road,
      Lat,
      Long,
      Price1,
      Price2,
      Price3,
      Price4,
    } = station;

    // Query for road ID based on the road name
    const [roadRows] = await pool.query("SELECT id FROM roads WHERE name = ?", [
      Road,
    ]);

    if (roadRows.length === 0) {
      throw new CustomError.BadRequest(`Road with name "${Road}" not found.`);
    }

    const roadId = roadRows[0].id;

    // Insert the station into the database
    await pool.query(
      "INSERT INTO toll_stations (id, latitude, longitude, name, locality, road_id, type, op_id, price1, price2, price3, price4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        TollID,
        Lat,
        Long,
        Name,
        Locality,
        roadId,
        PM,
        OpID,
        Price1,
        Price2,
        Price3,
        Price4,
      ]
    );
  }

  res.status(200).json({ status: "OK" });
});

// Reset all toll passes in the database
const resetPasses = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM toll_passes"); // Truncate the toll_passes table
  await pool.query("ALTER TABLE toll_passes AUTO_INCREMENT = 1;"); // Reset auto-increment

  const hashedPassword = await bcrypt.hash("freepasses4all", 10);

  await pool.query("UPDATE admin SET password=?", [hashedPassword]);

  res.status(200).json({ status: "OK" });
});

const modifyUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    throw new CustomError.BadRequest("Username and password are required");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password in the database
  const [result] = await pool.execute(
    "UPDATE operators SET password = ? WHERE username = ?",
    [hashedPassword, username]
  );

  // Check if the user was successfully updated
  if (result.affectedRows === 0) {
    try {
      await pool.execute(
        "INSERT INTO admin (username, password) VALUES (?, ?)",
        [username, hashedPassword]
      );
    } catch {
      throw new CustomError.InternalError("error");
    }
  }

  // Send a success response
  res.status(200).json({ message: "success" });
});

const getUsers = asyncHandler(async (req, res) => {
  const [users] = await pool.execute("SELECT username FROM operators;");
  if (users.length == 0) {
    throw new CustomError.NoContent(
      "There are no registered users in the system!"
    );
  }

  res.status(200).json(users);
});

module.exports = {
  addPasses,
  resetStations,
  resetPasses,
  healthCheck,
  modifyUser,
  getUsers,
};

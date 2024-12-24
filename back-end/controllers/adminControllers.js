const fs = require("fs");
const Papa = require("papaparse");
const pool = require("../db");
const path = require("path");
const { parse, format } = require("date-fns");

require("dotenv").config();

const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

const healthCheck = asyncHandler(async (req, res) => {
  // Replace with your actual database connection string
  const connectionString = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

  try {
    // Query the database to gather information
    const [[{ count: n_stations }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM toll_stations"
    );
    const [[{ count: n_tags }]] = await pool.query(
      "SELECT COUNT(DISTINCT tag_vehicle_ref_id) AS count FROM toll_passes;"
    );
    const [[{ count: n_passes }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM toll_passes;"
    );

    // Return success response
    res.status(200).json({
      status: "OK",
      dbconnection: connectionString,
      n_stations,
      n_tags,
      n_passes,
    });
  } catch (error) {
    res.status(401).json({
      status: "failed",
      dbconnection: connectionString,
    });
  }
});

const addPasses = asyncHandler(async (req, res, next) => {
  const csvFile = req.file;

  if (!csvFile) {
    throw new CustomError.BadRequest("The CSV file is missing.");
  }

  // Check if the MIME type is text/csv
  if (csvFile.mimetype !== "text/csv") {
    fs.unlinkSync(csvFile.path);
    throw new CustomError.BadRequest("The file is not a valid CSV file.");
  }

  const passes = [];

  // Reading and processing the CSV file using papaparse
  await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(csvFile.path);
    let csvData = "";

    fileStream.on("data", (chunk) => {
      csvData += chunk;
    });

    fileStream.on("end", () => {
      try {
        // Parse the CSV data
        const parsedData = Papa.parse(csvData, {
          header: true, // Treat first row as header
          skipEmptyLines: true, // Ignore empty lines
        });

        if (parsedData.errors.length > 0) {
          throw new CustomError.InternalError(
            "Error while parsing the CSV file."
          );
        }

        // Push parsed data into passes array
        passes.push(...parsedData.data);

        fs.unlinkSync(csvFile.path); // Remove the uploaded file after processing
        resolve(); // Resolve when parsing is finished
      } catch (err) {
        fs.unlinkSync(csvFile.path);
        reject(
          new CustomError.InternalError("Error while processing the CSV file.")
        );
      }
    });

    fileStream.on("error", (err) => {
      fs.unlinkSync(csvFile.path);
      reject(
        new CustomError.InternalError("Error while reading the CSV file.")
      );
    });
  });

  if (passes.length === 0) {
    throw new CustomError.NoContent("No data found in the CSV file.");
  }

  // Inserting data into the database
  for (const pass of passes) {
    const { timestamp, tollID, tagHomeID, tagRef, charge } = pass;
    let parsedDate = parse(timestamp, "MM-dd-yy", new Date());
    let formattedDate = format(parsedDate, "yyyy-MM-dd");

    // Insert pass into the database here
    await pool.query(
      "INSERT INTO toll_passes (timestamp,toll_id,tag_operator_id,tag_vehicle_ref_id,charge) VALUES (?, ?, ?, ?,?)",
      [formattedDate, tollID, tagHomeID, tagRef, charge]
    );
  }

  res.status(200).json({ status: "OK" }); // Success response
});

const resetStations = asyncHandler(async (req, res) => {
  // Path to the CSV file in the specified folder
  const filePath = path.join(__dirname, "../files/tollstations2024.csv");

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new CustomError.BadRequest(
      "The CSV file does not exist in the specified directory."
    );
  }

  const stations = [];

  // Read and process the CSV file using papaparse
  await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    let csvData = "";

    fileStream.on("data", (chunk) => {
      csvData += chunk;
    });

    fileStream.on("end", () => {
      try {
        // Parse the CSV data
        const parsedData = Papa.parse(csvData, {
          header: true, // Treat first row as header
          skipEmptyLines: true, // Ignore empty lines
        });

        if (parsedData.errors.length > 0) {
          throw new CustomError.InternalError(
            "Error while parsing the CSV file."
          );
        }

        // Push parsed data into stations array
        stations.push(...parsedData.data);

        resolve(); // Resolve when parsing is finished
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
    throw new CustomError.NoContent("No data found in the CSV file.");
  }

  await pool.query(
    "ALTER TABLE toll_passes DROP FOREIGN KEY FK_Toll_Pass_TollID;"
  );

  await pool.query("ALTER TABLE toll_passes DROP INDEX FK_Toll_Pass_TollID;");

  // Clear the toll stations table before inserting the new data
  await pool.query("TRUNCATE TABLE toll_stations");

  // Insert new toll stations from the CSV into the database
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

    // Find road_id by road name
    const [roadRows] = await pool.query("SELECT id FROM roads WHERE name = ?", [
      Road,
    ]);

    if (roadRows.length === 0) {
      throw new CustomError.BadRequest(`Road with name "${Road}" not found.`);
    }

    const roadId = roadRows[0].id;

    await pool.query(
      "INSERT INTO toll_stations (id, latitude, longitude, name, locality, road_id, type, op_id, price1, price2, price3, price4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?)",
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

  await pool.query(
    "ALTER TABLE toll_passes ADD CONSTRAINT FK_Toll_Pass_TollID FOREIGN KEY (toll_id) REFERENCES toll_stations(id) ON UPDATE CASCADE;"
  );

  res.status(200).json({ status: "OK" });
});

const resetPasses = asyncHandler(async (req, res) => {
  await pool.query("TRUNCATE TABLE toll_passes");
  await pool.query("ALTER TABLE toll_passes AUTO_INCREMENT = 1;");

  res.status(200).json({ status: "OK" });
});

module.exports = { addPasses, resetStations, resetPasses, healthCheck };

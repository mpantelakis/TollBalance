// Required modules for database connection
const pool = require("../db");
const json2csv = require("json2csv").parse;

// Importing custom error handling and async handler utility
const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

// Handler to get toll station passes within a specific date range
const tollStationPasses = asyncHandler(async (req, res) => {
  // Extract toll station ID and date range from request parameters
  const { tollStationID, date_from, date_to } = req.params;
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  const tollStationIDRegex = /^(?=.*[A-Z])(?=.*\d)[A-Z0-9]+$/;
  if (!tollStationID || !tollStationIDRegex.test(tollStationID)) {
    throw new CustomError.BadRequest("Invalid toll station ID.");
  }

  // Regular expression to validate date format (YYYYMMDD)
  const dateFormatRegex = /^\d{8}$/;

  // Validate 'date_from' parameter
  if (!date_from || !dateFormatRegex.test(date_from)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to || !dateFormatRegex.test(date_to)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );
  }

  // Format the dates to YYYY-MM-DD for SQL compatibility
  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

  // SQL query to get toll station pass data
  const query = `
        WITH PassData AS (
            SELECT
                ROW_NUMBER() OVER (ORDER BY id) AS passIndex,
                id AS passID,
                timestamp,
                tag_vehicle_ref_id AS tagID,
                tag_operator_id AS tagProvider,
                CASE
                    WHEN tag_operator_id = (
                        SELECT op_id
                        FROM toll_stations
                        WHERE id = toll_passes.toll_id
                    ) THEN 'home'
                    ELSE 'visitor'
                END AS passType,
                ROUND(charge, 1) AS passCharge
            FROM toll_passes
            WHERE toll_id = ?
                AND timestamp >= ?
                AND timestamp <= ?
            ORDER BY timestamp ASC
        )
        SELECT
			toll_stations.id as stationID,
			operators.name AS stationOperator,
            DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
            ? AS periodFrom,
            ? AS periodTo,
            COUNT(*) AS nPasses,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'passIndex', passIndex,
                    'passID', passID,
                    'timestamp', DATE_FORMAT(timestamp,'%Y-%m-%d %H:%i'),
                    'tagID', tagID,
                    'tagProvider', tagProvider,
                    'passType', passType,
                    'passCharge', passCharge
                )
            ) AS passList
        FROM toll_stations
		JOIN PassData ON toll_stations.id = ?
        JOIN operators ON operators.id=toll_stations.op_id
		WHERE toll_stations.id = ?
        GROUP BY toll_stations.id;`;

  // Execute the query with the provided parameters
  const [rows] = await pool.execute(query, [
    tollStationID,
    formattedDateFrom,
    formattedDateTo,
    formattedDateFrom,
    formattedDateTo,
    tollStationID,
    tollStationID,
  ]);

  // If no data is found, return a "No Content" error
  if (rows.length === 0) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  // If format is 'csv', convert the rows to CSV
  if (format === "csv") {
    const csv = json2csv(rows); // Convert rows to CSV
    res.header("Content-Type", "text/csv");
    res.attachment("toll_station_passes.csv");
    return res.send(csv); // Send the CSV data
  }

  // Default to JSON format if 'csv' is not specified
  res.json(rows[0]);
});

// Handler to analyze passes based on station and tag operator IDs and date range
const passAnalysis = asyncHandler(async (req, res) => {
  const { stationOpID, tagOpID, date_from, date_to } = req.params;
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate station and tag operator IDs
  const OpIDRegex = /^[A-Z]+$/;
  if (!stationOpID || !OpIDRegex.test(stationOpID)) {
    throw new CustomError.BadRequest("Invalid station operator ID.");
  }

  if (!tagOpID || !OpIDRegex.test(tagOpID)) {
    throw new CustomError.BadRequest("Invalid tag operator ID.");
  }

  // Validate date format for 'date_from' and 'date_to'
  const dateFormatRegex = /^\d{8}$/;
  if (!date_from || !dateFormatRegex.test(date_from)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );
  }

  if (!date_to || !dateFormatRegex.test(date_to)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );
  }

  // Format the dates for SQL query
  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

  // SQL query to analyze passes based on operators and date range
  const query = `
        WITH PassData AS (
            SELECT
                ROW_NUMBER() OVER (ORDER BY p.id) AS passIndex,
                p.id AS passID,
                p.toll_id AS stationID,
                p.timestamp,
                p.tag_vehicle_ref_id AS tagID,
                ROUND(p.charge, 1) AS passCharge
            FROM toll_passes p
            JOIN toll_stations s
            ON p.toll_id = s.id
            WHERE s.op_id = ?
                AND p.tag_operator_id = ?
                AND p.timestamp >= ?
                AND p.timestamp <= ?
            ORDER BY timestamp ASC
        )
        SELECT
            ? AS stationOpID,
            ? AS tagOpID,
            DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
            ? AS periodFrom,
            ? AS periodTo,
            COUNT(*) AS nPasses,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'passIndex', passIndex,
                    'passID', passID,
                    'stationID', stationID,
                    'timestamp', DATE_FORMAT(timestamp,'%Y-%m-%d %H:%i'),
                    'tagID', tagID,
                    'passCharge', passCharge
                )
            ) AS passList
        FROM PassData;`;

  // Execute the query with the provided parameters
  const [rows] = await pool.execute(query, [
    stationOpID,
    tagOpID,
    formattedDateFrom,
    formattedDateTo,
    stationOpID,
    tagOpID,
    formattedDateFrom,
    formattedDateTo,
  ]);

  // If no data is found, return a "No Content" error
  if (rows[0].passList === null) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }
  // If format is 'csv', convert the rows to CSV
  if (format === "csv") {
    const csv = json2csv(rows); // Convert rows to CSV
    res.header("Content-Type", "text/csv");
    res.attachment("toll_station_passes.csv");
    return res.send(csv); // Send the CSV data
  }

  // Default to JSON format if 'csv' is not specified
  res.json(rows[0]);
});

// Handler to calculate the total cost of passes based on operator and date range
const passesCost = asyncHandler(async (req, res) => {
  const { tollOpID, tagOpID, date_from, date_to } = req.params;
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate toll and tag operator IDs
  const OpIDRegex = /^[A-Z]+$/;
  if (!tollOpID || !OpIDRegex.test(tollOpID)) {
    throw new CustomError.BadRequest("Invalid toll operator ID.");
  }

  if (!tagOpID || !OpIDRegex.test(tagOpID)) {
    throw new CustomError.BadRequest("Invalid tag operator ID.");
  }

  // Validate date format for 'date_from' and 'date_to'
  const dateFormatRegex = /^\d{8}$/;
  if (!date_from || !dateFormatRegex.test(date_from)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );
  }

  if (!date_to || !dateFormatRegex.test(date_to)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );
  }

  // Format the dates for SQL query
  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

  // SQL query to calculate the total cost of passes
  const query = `
        SELECT
            ? AS tollOpID,
            ? AS tagOpID,
            DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
            ? AS periodFrom,
            ? AS periodTo,
            COUNT(1) AS nPasses,
            ROUND(SUM(p.charge), 1) AS passesCost
        FROM toll_passes p
        JOIN toll_stations s
        ON p.toll_id = s.id
        WHERE s.op_id = ?
            AND p.tag_operator_id = ?
            AND p.timestamp >= ?
            AND p.timestamp <= ?;`;

  // Execute the query with the provided parameters
  const [rows] = await pool.execute(query, [
    tollOpID,
    tagOpID,
    formattedDateFrom,
    formattedDateTo,
    tollOpID,
    tagOpID,
    formattedDateFrom,
    formattedDateTo,
  ]);

  // If no data is found, return a "No Content" error
  if (rows[0].passesCost === null) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  // If format is 'csv', convert the rows to CSV
  if (format === "csv") {
    const csv = json2csv(rows); // Convert rows to CSV
    res.header("Content-Type", "text/csv");
    res.attachment("toll_station_passes.csv");
    return res.send(csv); // Send the CSV data
  }

  // Default to JSON format if 'csv' is not specified
  res.json(rows[0]);
});

// Handler to calculate charges for visits by different operators
const chargesBy = asyncHandler(async (req, res) => {
  const { tollOpID, date_from, date_to } = req.params;
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate toll operator ID
  const tollOpIDRegex = /^[A-Z]+$/;
  if (!tollOpID || !tollOpIDRegex.test(tollOpID)) {
    throw new CustomError.BadRequest("Invalid station operator ID.");
  }

  // Validate date format for 'date_from' and 'date_to'
  const dateFormatRegex = /^\d{8}$/;
  if (!date_from || !dateFormatRegex.test(date_from)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );
  }

  if (!date_to || !dateFormatRegex.test(date_to)) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );
  }

  // Format the dates for SQL query
  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

  // SQL query to calculate charges by visiting operators
  const query = `
        WITH CostsData AS
        (SELECT
            p.tag_operator_id AS visitingOpID,
            COUNT(1) AS nPasses,
            ROUND(SUM(p.charge), 1) AS passesCost
        FROM toll_passes p
        JOIN toll_stations s
        ON p.toll_id = s.id
        WHERE s.op_id = ?
            AND p.tag_operator_id != s.op_id
            AND p.timestamp >= ?
            AND p.timestamp <= ?
        GROUP BY p.tag_operator_id)
        SELECT
            ? AS tollOpID,
            DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
            ? AS periodFrom,
            ? AS periodTo,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'visitingOpID', visitingOpID,
                    'nPasses', nPasses,
                    'passesCost', passesCost
                )
            ) AS VOpList
        FROM CostsData;`;

  // Execute the query with the provided parameters
  const [rows] = await pool.execute(query, [
    tollOpID,
    formattedDateFrom,
    formattedDateTo,
    tollOpID,
    formattedDateFrom,
    formattedDateTo,
  ]);

  // If no data is found, return a "No Content" error
  if (rows[0].VOpList === null) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  // If format is 'csv', convert the rows to CSV
  if (format === "csv") {
    const csv = json2csv(rows); // Convert rows to CSV
    res.header("Content-Type", "text/csv");
    res.attachment("toll_station_passes.csv");
    return res.send(csv); // Send the CSV data
  }

  // Default to JSON format if 'csv' is not specified
  res.json(rows[0]);
});

// Export all the handlers as a module
module.exports = { tollStationPasses, passAnalysis, passesCost, chargesBy };

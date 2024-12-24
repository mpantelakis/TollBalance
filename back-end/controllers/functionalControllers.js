const fs = require("fs");
const Papa = require("papaparse");
const pool = require("../db");

const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

const tollStationPasses = asyncHandler(async (req, res) => {
  const { tollStationID, date_from, date_to } = req.params;

  if (!tollStationID) {
    throw new CustomError.BadRequest("Invalid toll station ID.");
  }

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

  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

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
                charge AS passCharge
            FROM toll_passes
            WHERE toll_id = ?
                AND timestamp >= ?
                AND timestamp <= ?
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

  const [rows] = await pool.execute(query, [
    tollStationID,
    formattedDateFrom,
    formattedDateTo,
    formattedDateFrom,
    formattedDateTo,
    tollStationID,
    tollStationID,
  ]);

  if (rows.length === 0) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  res.json(rows);
});

const passAnalysis = asyncHandler(async (req, res) => {
  const { stationOpID, tagOpID, date_from, date_to } = req.params;

  if (!stationOpID) {
    throw new CustomError.BadRequest("Invalid station operator ID.");
  }

  if (!tagOpID) {
    throw new CustomError.BadRequest("Invalid tag operator ID.");
  }

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

  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

  const query = `
        WITH PassData AS (
            SELECT
                ROW_NUMBER() OVER (ORDER BY p.id) AS passIndex,
                p.id AS passID,
                p.toll_id AS stationID,
                p.timestamp,
                p.tag_vehicle_ref_id AS tagID,
                p.charge AS passCharge
            FROM toll_passes p
            JOIN toll_stations s
            ON p.toll_id = s.id
            WHERE s.op_id = ?
                AND p.tag_operator_id = ?
                AND p.timestamp >= ?
                AND p.timestamp <= ?
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

  if (rows.length === 0) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  res.json(rows);
});

const passesCost = asyncHandler(async (req, res) => {
  const { tollOpID, tagOpID, date_from, date_to } = req.params;

  if (!tollOpID) {
    throw new CustomError.BadRequest("Invalid station operator ID.");
  }

  if (!tagOpID) {
    throw new CustomError.BadRequest("Invalid tag operator ID.");
  }

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

  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

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

  if (rows.length === 0) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  res.json(rows);
});

const chargesBy = asyncHandler(async (req, res) => {
  const { tollOpID, date_from, date_to } = req.params;

  if (!tollOpID) {
    throw new CustomError.BadRequest("Invalid station operator ID.");
  }

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

  const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(
    4,
    6
  )}-${date_from.slice(6, 8)}`;
  const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(
    4,
    6
  )}-${date_to.slice(6, 8)}`;

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

  const [rows] = await pool.execute(query, [
    tollOpID,
    formattedDateFrom,
    formattedDateTo,
    tollOpID,
    formattedDateFrom,
    formattedDateTo,
  ]);

  if (rows.length === 0) {
    throw new CustomError.NoContent(
      "No data found for the specified parameters."
    );
  }

  res.json(rows);
});
module.exports = { tollStationPasses, passAnalysis, passesCost, chargesBy };

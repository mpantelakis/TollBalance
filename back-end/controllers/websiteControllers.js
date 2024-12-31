const pool = require("../db");
const json2csv = require("json2csv").parse;
const jwt = require("jsonwebtoken");
const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

const NotSettled = asyncHandler(async (req, res) => {
  const token = req.headers["x-observatory-auth"]; // Get the token from the request header

  if (!token) {
    throw new CustomError.NotAuthorized("No token provided");
  }

  let decoded;
  try {
    // Decode the token to extract operatorID
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new CustomError.NotAuthorized("Invalid or expired token");
  }

  const { id } = decoded; // Extract operatorID from decoded payload
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID (debtor)
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  const query = `
    SELECT
	    op.name AS creditorName,
	    ROUND(SUM(db.amount), 1) AS totalOwed
    FROM operators op
    JOIN debts db
    ON op.id = db.creditor
    WHERE db.debtor = ?
	    AND db.settled = 0
	    AND db.verified = 0
    GROUP BY (op.name);`;

  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No outstanding debts found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("not_settled.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const NotVerified = asyncHandler(async (req, res) => {
    const token = req.headers["x-observatory-auth"];
  
    if (!token) {
      throw new CustomError.NotAuthorized("No token provided");
    }
  
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new CustomError.NotAuthorized("Invalid or expired token");
    }
  
    const { id } = decoded;
    const { format = "json" } = req.query;
  
    if (!id) {
      throw new CustomError.BadRequest("Invalid operator ID.");
    }
  
    const query = `
      SELECT
        op.name AS debtorName,
        ROUND(SUM(db.amount), 1) AS totalSettled
      FROM operators op
      JOIN debts db
      ON op.id = db.debtor
      WHERE db.creditor = ?
        AND db.settled = 1
        AND db.verified = 0
      GROUP BY (op.name);`;
  
    const [rows] = await pool.execute(query, [id]);
  
    if (rows.length === 0) {
      throw new CustomError.NoContent("No unverified debts found for the specified operator.");
    }
  
    if (format === "csv") {
      const csv = json2csv(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("not_verified.csv");
      return res.send(csv);
    }
  
    res.json(rows);
  });

module.exports = { NotSettled, NotVerified };

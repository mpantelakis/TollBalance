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
      op.id AS creditorId,
	    op.name AS creditorName,
	    ROUND(SUM(db.amount), 1) AS totalOwed
    FROM operators op
    JOIN debts db
    ON op.id = db.creditor
    WHERE db.debtor = ?
	    AND db.settled = 0
	    AND db.verified = 0
    GROUP BY (op.id);`;

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

const TotalNotSettled = asyncHandler(async (req, res) => {
  const token = req.headers["x-observatory-auth"]; // Get the token from the request header

  if (!token) {
    throw new CustomError.NotAuthorized("No token provided");
  }

  let decoded;
  try {
    // Decode the token to extract operatorID (debtor)
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new CustomError.NotAuthorized("Invalid or expired token");
  }

  const { id } = decoded; // Extract operatorID (debtor) from decoded payload
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID (debtor)
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  const query = `
    SELECT
      ROUND(SUM(db.amount), 1) AS totalOwed
    FROM debts db
    WHERE db.debtor = ?
      AND db.settled = 0
      AND db.verified = 0;`;

  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No outstanding debts found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("total_not_settled.csv");
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
        op.id AS debtorId,
        op.name AS debtorName,
        ROUND(SUM(db.amount), 1) AS totalSettled
      FROM operators op
      JOIN debts db
      ON op.id = db.debtor
      WHERE db.creditor = ?
        AND db.settled = 1
        AND db.verified = 0
      GROUP BY (op.id);`;
  
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

  const TotalNotVerified = asyncHandler(async (req, res) => {
    const token = req.headers["x-observatory-auth"]; // Get the token from the request header
  
    if (!token) {
      throw new CustomError.NotAuthorized("No token provided");
    }
  
    let decoded;
    try {
      // Decode the token to extract operatorID (debtor)
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new CustomError.NotAuthorized("Invalid or expired token");
    }
  
    const { id } = decoded; // Extract operatorID (debtor) from decoded payload
    const { format = "json" } = req.query; // Default to 'json' if format is not provided
  
    // Validate operatorID (debtor)
    if (!id) {
      throw new CustomError.BadRequest("Invalid operator ID.");
    }
  
    const query = `
      SELECT
        ROUND(SUM(db.amount), 1) AS totalOwed
      FROM debts db
      WHERE db.creditor = ?
        AND db.settled = 1
        AND db.verified = 0;`;
  
    const [rows] = await pool.execute(query, [id]);
  
    if (rows.length === 0 || rows[0].totalOwed === null) {
      throw new CustomError.NoContent("No unsettled debts found for the specified operator.");
    }
  
    const totalOwed = rows[0].totalOwed;
  
    if (format === "csv") {
      // If CSV is requested, return total amount as a single row
      const csv = json2csv([{ totalOwed }]);
      res.header("Content-Type", "text/csv");
      res.attachment("total_not_verified.csv");
      return res.send(csv);
    }
  
    res.json({ totalOwed });
  });
  

const SettleDebt = asyncHandler(async (req, res) => {
  const token = req.headers["x-observatory-auth"]; // Get the token from headers

  if (!token) {
    throw new CustomError.NotAuthorized("No token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token to get the user ID
  } catch (err) {
    throw new CustomError.NotAuthorized("Invalid or expired token");
  }

  const { id: debtorId } = decoded; // Get the signed-in user's ID
  const { creditorId } = req.params; // Get creditor ID from the URL
  const { format = "json" } = req.query;

  // Validate input
  if (!creditorId) {
    throw new CustomError.BadRequest("Creditor ID is required.");
  }

  // Update the database to mark the debts as settled
  const query = `
    UPDATE debts
    SET settled = 1
    WHERE debtor = ? AND creditor = ? AND settled = 0 AND verified = 0;
  `;

  const [result] = await pool.execute(query, [debtorId, creditorId]);

  // Check if any rows were updated
  if (result.affectedRows === 0) {
    throw new CustomError.NoContent("No unsettled debts found for the specified creditor.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("settledebt.csv");
    return res.send(csv);
  }

  res.json(result);

});


module.exports = { NotSettled, TotalNotSettled, NotVerified, TotalNotVerified, SettleDebt };

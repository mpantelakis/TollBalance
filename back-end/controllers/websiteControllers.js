const pool = require("../db");
const json2csv = require("json2csv").parse;
const CustomError = require("../errors/customErrors");
const asyncHandler = require("express-async-handler");

const NotSettled = asyncHandler(async (req, res) => {

  const { id } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID (debtor)
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  const query = `
    SELECT
      op.id AS creditorId,
      op.name AS creditorName,
      ROUND(COALESCE(SUM(db.amount), 0), 1) AS totalOwed
    FROM operators op
    LEFT JOIN debts db
      ON op.id = db.creditor
      AND db.debtor = ?
      AND db.settled = 0
      AND db.verified = 0
    WHERE op.id != ?
    GROUP BY op.id;

`;

  const [rows] = await pool.execute(query, [id, id]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No unsettled debts found for the specified operator.");
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

  const { id } = req.params; // Extract signed-in operatorID (debtor) 
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
    throw new CustomError.NoContent("No unsettled debts found for the specified operator.");
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
  
    const { id } = req.params;  // Extract signed-in operatorID (creditor)
    const { format = "json" } = req.query;
  
    if (!id) {
      throw new CustomError.BadRequest("Invalid operator ID.");
    }
  
    const query = `
      SELECT
        op.id AS debtorId,
        op.name AS debtorName,
        ROUND(COALESCE(SUM(db.amount), 0), 1) AS totalSettled
      FROM operators op
      LEFT JOIN debts db
        ON op.id = db.debtor
        AND db.creditor = ?
        AND db.settled = 1
        AND db.verified = 0
      WHERE op.id != ?
      GROUP BY op.id;`;
  
    const [rows] = await pool.execute(query, [id, id]);
  
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
  
    const { id } = req.params; // Extract signed-in operatorID (creditor) 
    const { format = "json" } = req.query; // Default to 'json' if format is not provided
  
    // Validate operatorID 
    if (!id) {
      throw new CustomError.BadRequest("Invalid operator ID.");
    }
  
    const query = `
      SELECT
        ROUND(SUM(db.amount), 1) AS totalSettled
      FROM debts db
      WHERE db.creditor = ?
        AND db.settled = 1
        AND db.verified = 0;`;
  
    const [rows] = await pool.execute(query, [id]);
  
    if (rows.length === 0) {
      throw new CustomError.NoContent("No unverified debts found for the specified operator.");
    }
  
    if (format === "csv") {
      const csv = json2csv(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("total_not_verified.csv");
      return res.send(csv);
    }
  
    res.json(rows);
  });
  

const SettleDebt = asyncHandler(async (req, res) => {

  const { debtorId } = req.params; // Get the signed-in operator's ID (debtor) and the creditor ID 
  const { creditorId } = req.params;
  const { format = "json" } = req.query;

  // Validate input
  if (!debtorId) {
    throw new CustomError.BadRequest("Debtor ID is required.");
  }
  if (!creditorId) {
    throw new CustomError.BadRequest("Creditor ID is required.");
  }

  // Update the database to mark the debts as settled
  const query = `
    UPDATE debts
    SET settled = 1
    WHERE debtor = ? AND creditor = ? AND settled = 0 AND verified = 0;
  `;

  const [rows] = await pool.execute(query, [debtorId, creditorId]);

  // Check if any rows were updated
  if (rows.affectedRows === 0) {
    throw new CustomError.NoContent("No unsettled debts found for the specified creditor.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("settle_debt.csv");
    return res.send(csv);
  }

  // Respond with the number of rows updated
  res.json({
    status: "success",
    message: `Debt settled successfully.`,
  });

});

const VerifyPayment = asyncHandler(async (req, res) => {
  
  const { creditorId } = req.params; // Get the signed-in operator's ID (creditor)
  const { debtorId } = req.params; // Get the debtor ID 
  const { format = "json" } = req.query;

  // Validate input
  if (!debtorId) {
    throw new CustomError.BadRequest("Debtor ID is required.");
  }
  if (!creditorId) {
    throw new CustomError.BadRequest("Creditor ID is required.");
  }

  // Update the database to mark the debts as verified
  const query = `
    UPDATE debts
    SET verified = 1
    WHERE debtor = ? AND creditor = ? AND settled = 1 AND verified = 0;
  `;

  const [rows] = await pool.execute(query, [debtorId, creditorId]);

  // Check if any rows were updated
  if (rows.affectedRows === 0) {
    throw new CustomError.NoContent("No payments to verify for the specified debtor.");
  }

  // If CSV format is requested
  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("verify_payment.csv");
    return res.send(csv);
  }

  // Respond with the number of rows updated
  res.json({
    status: "success",
    message: `Payment verified successfully.`,
  });
});

const HistoryDebt = asyncHandler(async (req, res) => {
  const { debtorId, creditorId } = req.params; // Debtor is the signed-in operator
  const { format = "json" } = req.query;

  // Validate input
  if (!debtorId) {
    throw new CustomError.BadRequest("Debtor ID is required.");
  }
  if (!creditorId) {
    throw new CustomError.BadRequest("Creditor ID is required.");
  }

  const [rows] = await pool.query(
    `
  SELECT 
	  m.month AS month,
	  ROUND(COALESCE(SUM(d.amount), 0), 1) AS totalDebts
  FROM months m
  LEFT JOIN debts d
  ON DATE_FORMAT(d.date_created, '%Y-%m') = m.month
    AND d.creditor = ?
    AND d.debtor = ?
  WHERE m.month > DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 12 MONTH), '%Y-%m')
  GROUP BY m.month
  ORDER BY m.month DESC;`,
    [creditorId, debtorId]
  );

  // If CSV format is requested
  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("history_debt.csv");
    return res.send(csv);
  }

  // Return the results from the stored procedure
  res.json(rows);
});

const TrafficVariation = asyncHandler(async (req, res) => {
  
  const { id, date_from, date_to } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  // Validate 'date_from' parameter
  if (!date_from) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter."
    );
  }

  const query = `
  SELECT
    m.month,
    COALESCE(COUNT(s.op_id), 0) AS totalPasses
  FROM months m
  LEFT JOIN toll_passes p
  ON DATE_FORMAT(p.timestamp, '%Y-%m') = m.month
  LEFT JOIN toll_stations s
  ON p.toll_id = s.id
    AND s.op_id = ?
  GROUP BY m.month
    HAVING m.month >= DATE_FORMAT(?, '%Y-%m')
    AND m.month <= DATE_FORMAT(?, '%Y-%m')
  ORDER BY m.month DESC;
    `;

  const [rows] = await pool.execute(query, [id, date_from, date_to]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No toll passes found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("traffic_variation.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const RoadsPerOperator = asyncHandler(async (req, res) => {
  
  const { id } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  const query = `
  SELECT
    r.* 
  FROM toll_stations s
  JOIN roads r
  ON r.id = s.road_id
  WHERE s.op_id = ?
  GROUP BY r.id;
    `;

  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No roads found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("roads_per_operator.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const TrafficVariationPerRoad = asyncHandler(async (req, res) => {
  
  const { id, road, date_from, date_to } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  // Validate 'date_from' parameter
  if (!date_from) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter."
    );
  }

  const query = `
  SELECT
	  m.month,
	  COALESCE(COUNT(s.op_id), 0) AS totalPasses
  FROM months m
  LEFT JOIN toll_passes p
  ON DATE_FORMAT(p.timestamp, '%Y-%m') = m.month
  LEFT JOIN toll_stations s
  ON p.toll_id = s.id
    AND s.op_id = ?
    AND s.road_id = ?
  GROUP BY m.month
    HAVING m.month >= DATE_FORMAT(?, '%Y-%m')
  AND m.month <= DATE_FORMAT(?, '%Y-%m')
  ORDER BY m.month DESC;
    `;

  const [rows] = await pool.execute(query, [id, road, date_from, date_to]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No toll passes found for the specified road.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("traffic_variation_per_road.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const TrafficDistribution = asyncHandler(async (req, res) => {
  
  const { id, date_from, date_to } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  // Validate 'date_from' parameter
  if (!date_from) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter."
    );
  }

  const query = `
  SELECT
    r.name AS road,
    COUNT(p.id) AS totalPasses
  FROM toll_passes p
  JOIN toll_stations s
  ON p.toll_id = s.id
  JOIN roads r
  ON r.id = s.road_id
  WHERE s.op_id = ? 
    AND p.timestamp >= ?
    AND p.timestamp <= ?
  GROUP BY r.name;
    `;

  const [rows] = await pool.execute(query, [id, date_from, date_to]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No toll passes found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("traffic_distribution.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const MostPopularTollBooths = asyncHandler(async (req, res) => {
  
  const { id } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  const query = `
  SELECT
    s.name AS tollBooth,
    COUNT(p.id) AS totalPasses
  FROM toll_passes p
  JOIN toll_stations s
  ON p.toll_id = s.id
  WHERE s.op_id = ?
  GROUP BY p.toll_id
  ORDER BY totalPasses DESC
  LIMIT 5;
    `;

  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No toll passes found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("most_popular_toll_booths.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const OtherOperators = asyncHandler(async (req, res) => {
  
  const { id } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  const query = `
  SELECT * FROM operators WHERE id != ?;
    `;

  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No other operators found.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("other_operators.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const DebtHistoryChart = asyncHandler(async (req, res) => {
  
  const { debtorId, creditorId, date_from, date_to } = req.params; // Debtor is the signed-in operator
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!debtorId) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  if (!creditorId) {
    throw new CustomError.BadRequest("Invalid creditor ID.");
  }

  // Validate 'date_from' parameter
  if (!date_from) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter."
    );
  }

  const query = `
  SELECT 
    m.month AS month,
    ROUND(COALESCE(SUM(d.amount), 0), 1) AS totalDebts
  FROM months m
  LEFT JOIN debts d
  ON DATE_FORMAT(d.date_created, '%Y-%m') = m.month
    AND d.creditor = ?
    AND d.debtor = ?
  WHERE m.month >= DATE_FORMAT(?, '%Y-%m')
    AND m.month <= DATE_FORMAT(?, '%Y-%m')
  GROUP BY m.month
  ORDER BY m.month DESC;
    `;

  const [rows] = await pool.execute(query, [creditorId, debtorId, date_from, date_to]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No debt history found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("debt_history_chart.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const OwedAmountsChart = asyncHandler(async (req, res) => {
  
  const { creditorId, debtorId, date_from, date_to } = req.params; // Creditor is the signed-in operator 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!debtorId) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  if (!creditorId) {
    throw new CustomError.BadRequest("Invalid creditor ID.");
  }

  // Validate 'date_from' parameter
  if (!date_from) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter."
    );
  }

  const query = `
  SELECT 
    m.month AS month,
    ROUND(COALESCE(SUM(d.amount), 0), 1) AS totalDebts
  FROM months m
  LEFT JOIN debts d
  ON DATE_FORMAT(d.date_created, '%Y-%m') = m.month
    AND d.creditor = ?
    AND d.debtor = ?
  WHERE m.month >= DATE_FORMAT(?, '%Y-%m')
    AND m.month <= DATE_FORMAT(?, '%Y-%m')
  GROUP BY m.month
  ORDER BY m.month DESC;
    `;

  const [rows] = await pool.execute(query, [creditorId, debtorId, date_from, date_to]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No owed amounts found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("owed_amounts_chart.csv");
    return res.send(csv);
  }

  res.json(rows);
});

const RevenueDistribution = asyncHandler(async (req, res) => {
  
  const { id, date_from, date_to } = req.params; // Extract signed-in operatorID 
  const { format = "json" } = req.query; // Default to 'json' if format is not provided

  // Validate operatorID 
  if (!id) {
    throw new CustomError.BadRequest("Invalid operator ID.");
  }

  // Validate 'date_from' parameter
  if (!date_from) {
    throw new CustomError.BadRequest(
      "Invalid 'date_from' parameter."
    );
  }

  // Validate 'date_to' parameter
  if (!date_to) {
    throw new CustomError.BadRequest(
      "Invalid 'date_to' parameter."
    );
  }

  const query = `
  SELECT
    r.name AS road,
    ROUND(SUM(p.charge), 1) AS totalRevenues
  FROM toll_passes p
  JOIN toll_stations s
  ON p.toll_id = s.id
  JOIN roads r
  ON r.id = s.road_id
  WHERE s.op_id = ? 
    AND p.timestamp >= ?
    AND p.timestamp <= ?
  GROUP BY r.name;
    `;

  const [rows] = await pool.execute(query, [id, date_from, date_to]);

  if (rows.length === 0) {
    throw new CustomError.NoContent("No revenue found for the specified operator.");
  }

  if (format === "csv") {
    const csv = json2csv(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("revenue_distribution.csv");
    return res.send(csv);
  }

  res.json(rows);
});


module.exports = 
{ NotSettled, 
  TotalNotSettled, 
  NotVerified, 
  TotalNotVerified, 
  SettleDebt, 
  VerifyPayment, 
  HistoryDebt, 
  TrafficVariation, 
  RoadsPerOperator, 
  TrafficVariationPerRoad,
  TrafficDistribution,
  MostPopularTollBooths,
  OtherOperators,
  DebtHistoryChart,
  OwedAmountsChart,
  RevenueDistribution
};

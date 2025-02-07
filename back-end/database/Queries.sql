# -----------------------------------------
# REST API FUNCTIONALITY ENDPOINTS QUERIES
# -----------------------------------------


/*
 * Toll Station Passes
 */

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
	WHERE toll_id = "NAO03"
		AND timestamp >= "2022-01-01"
		AND timestamp <= "2022-01-31"
	ORDER BY timestamp ASC
)
SELECT
	toll_stations.id as stationID,
	operators.name AS stationOperator,
	DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
	"2022-01-01" AS periodFrom,
	"2022-01-31" AS periodTo,
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
JOIN PassData ON toll_stations.id = 'NAO03'
JOIN operators ON operators.id=toll_stations.op_id
WHERE toll_stations.id = 'NAO03'
GROUP BY toll_stations.id;


/*
 * Pass Analysis
 */

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
    WHERE s.op_id = 'NAO'
        AND p.tag_operator_id = 'EG'
        AND p.timestamp >= '2022-01-01'
        AND p.timestamp <= '2022-01-31'
    ORDER BY timestamp ASC
)
SELECT
	'NAO' AS stationOpID,
    'EG' AS tagOpID,
	DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
	"2022-01-01" AS periodFrom,
	"2022-01-31" AS periodTo,
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
FROM PassData;


/*
 * Passes Cost
 */

SELECT (
	SELECT
		COUNT(1)
	FROM toll_passes p
	JOIN toll_stations s
	ON p.toll_id = s.id
	WHERE s.op_id = 'NAO'
		AND p.tag_operator_id = 'EG'
		AND p.timestamp >= '2022-01-01'
		AND p.timestamp <= '2022-01-31'

	) AS nPasses,
	ROUND(SUM(amount), 1) AS passesCost
FROM debts
WHERE creditor = 'NAO'
	AND debtor = 'EG'
	AND date_created >= '2022-01-01'
	AND date_created <= '2022-01-31'
	AND settled = 0
	AND verified = 0;



/*
 * Charges By
 */

SELECT
	debtor AS visitingOpID,
	(SELECT
		COUNT(1)
	FROM toll_passes p
	JOIN toll_stations s
	ON p.toll_id = s.id
	WHERE s.op_id = 'NAO'
		AND p.tag_operator_id != s.op_id
		AND p.tag_operator_id = debtor
		AND p.timestamp >= '2022-01-01'
		AND p.timestamp <= '2022-01-31'
	) AS nPasses,
	ROUND(SUM(amount), 1) AS passesCost
FROM debts
WHERE creditor = 'NAO'
	AND date_created >= '2022-01-01'
	AND date_created <= '2022-01-31'
	AND settled = 0
	AND verified = 0
GROUP BY debtor;




# --------------------------------------------------------------
# REST API FUNCTIONALITY ENDPOINTS QUERIES FOR MANAGE DEBTS PAGE
# --------------------------------------------------------------


/*
 * Debts to each company
 */

SELECT
	op.id AS creditorId,
	op.name AS creditorName,
	ROUND(COALESCE(SUM(db.amount), 0), 1) AS totalOwed
FROM operators op
LEFT JOIN debts db
	ON op.id = db.creditor
	AND db.debtor = 'NAO'
	AND db.settled = 0
	AND db.verified = 0
WHERE op.id != 'NAO'
GROUP BY op.id;


/*
 * Total Debts 
 */

SELECT
	ROUND(SUM(db.amount), 1) AS totalOwed
FROM debts db
WHERE db.debtor = 'NAO'
	AND db.settled = 0
	AND db.verified = 0;


/*
 * Settled but not yet verified
 */

SELECT
	op.id AS debtorId,
	op.name AS debtorName,
	ROUND(COALESCE(SUM(db.amount), 0), 1) AS totalSettled
FROM operators op
LEFT JOIN debts db
	ON op.id = db.debtor
	AND db.creditor = 'NAO'
	AND db.settled = 1
	AND db.verified = 0
WHERE op.id != 'NAO'
GROUP BY op.id;


/*
 * Total settled but not yet verified
 */

SELECT
	ROUND(SUM(db.amount), 1) AS totalSettled
FROM debts db
WHERE db.creditor = 'NAO'
	AND db.settled = 1
	AND db.verified = 0;


/*
 * Update the database to mark the debts as settled
 */

UPDATE debts
    SET settled = 1
    WHERE debtor = 'NAO' AND creditor = 'EG' AND settled = 0 AND verified = 0;


/*
 * Update the database to mark the debts as verified
 */

UPDATE debts
    SET verified = 1
    WHERE debtor = 'NAO' AND creditor = 'EG' AND settled = 1 AND verified = 0;


/*
 * View Debt History for the last 12 months
 */

SELECT 
	m.month AS month,
	ROUND(COALESCE(SUM(d.amount), 0), 1) AS totalDebts
FROM months m
LEFT JOIN debts d
ON DATE_FORMAT(d.date_created, '%Y-%m') = m.month
	AND d.creditor = 'NAO'
	AND d.debtor = 'EG'
WHERE m.month > DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 12 MONTH), '%Y-%m')
GROUP BY m.month
ORDER BY m.month DESC;




# --------------------------------------------------------------
# REST API FUNCTIONALITY ENDPOINTS QUERIES FOR STATISTICS PAGE
# --------------------------------------------------------------


/*
 * Monthly passes through a company's toll network
 */

SELECT
	m.month,
	COALESCE(COUNT(s.op_id), 0) AS totalPasses
FROM months m
LEFT JOIN toll_passes p
ON DATE_FORMAT(p.timestamp, '%Y-%m') = m.month
LEFT JOIN toll_stations s
ON p.toll_id = s.id
	AND s.op_id = 'NAO'
GROUP BY m.month
	HAVING m.month >= DATE_FORMAT('2022-03-01', '%Y-%m')
AND m.month <= DATE_FORMAT('2023-03-01', '%Y-%m')
ORDER BY m.month DESC;


/*
 * Monthly passes through a company's toll stations on a spesific road
 */

SELECT
	m.month,
	COALESCE(COUNT(s.op_id), 0) AS totalPasses
FROM months m
LEFT JOIN toll_passes p
ON DATE_FORMAT(p.timestamp, '%Y-%m') = m.month
LEFT JOIN toll_stations s
ON p.toll_id = s.id
	AND s.op_id = 'NAO'
	AND s.road_id = 13
GROUP BY m.month
	HAVING m.month >= DATE_FORMAT('2022-03-01', '%Y-%m')
AND m.month <= DATE_FORMAT('2023-03-01', '%Y-%m')
ORDER BY m.month DESC;


/*
 * Total traffic per road
 */

SELECT
	r.name AS road,
	COUNT(p.id) AS totalPasses
FROM toll_passes p
JOIN toll_stations s
ON p.toll_id = s.id
JOIN roads r
ON r.id = s.road_id
WHERE s.op_id = 'NAO' 
	AND p.timestamp >= '2022-03-01'
	AND p.timestamp <= '2023-03-31'
GROUP BY r.name;


/*
 * Top 5 most popular toll booths
 */

SELECT
	s.name AS tollBooth,
	COUNT(p.id) AS totalPasses
FROM toll_passes p
JOIN toll_stations s
ON p.toll_id = s.id
WHERE s.op_id = 'NAO'
GROUP BY p.toll_id
ORDER BY totalPasses DESC
LIMIT 5;
	





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

SELECT
	'NAO' AS tollOpID,
    'EG' AS tagOpID,
	DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
    '2022-01-01' AS periodFrom,
    '2022-01-31' AS periodTo,
	COUNT(1) AS nPasses,
	ROUND(SUM(p.charge), 1) AS passesCost
FROM toll_passes p
JOIN toll_stations s
ON p.toll_id = s.id
WHERE s.op_id = 'NAO'
	AND p.tag_operator_id = 'EG'
	AND p.timestamp >= '2022-01-01'
	AND p.timestamp <= '2022-01-31';

/*
 * Charges By
 */

WITH CostsData AS 
(SELECT
	p.tag_operator_id AS visitingOpID,
	COUNT(1) AS nPasses,
	ROUND(SUM(p.charge), 1) AS passesCost
FROM toll_passes p
JOIN toll_stations s
ON p.toll_id = s.id
WHERE s.op_id = 'NAO'
	AND p.tag_operator_id != s.op_id
	AND p.timestamp >= '2022-01-01'
	AND p.timestamp <= '2022-01-31'
GROUP BY p.tag_operator_id)
SELECT
	'NAO' AS tollOpID,
	DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i') AS requestTimestamp,
	"2022-01-01" AS periodFrom,
	"2022-01-31" AS periodTo,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'visitingOpID', visitingOpID,
            'nPasses', nPasses,
			'passesCost', passesCost
        )
    ) AS VOpList
FROM CostsData;



# --------------------------------------------------------------
# REST API FUNCTIONALITY ENDPOINTS QUERIES FOR MANGE DEBTS PAGE
# --------------------------------------------------------------


/*
 * Debts to each company
 */

SELECT
	op.name AS creditorName,
	ROUND(SUM(db.amount), 1) AS totalOwed
FROM operators op
JOIN debts db
ON op.id = db.creditor
WHERE db.debtor = 'NAO'
	AND db.settled = 0
	AND db.verified = 0
GROUP BY (op.name);

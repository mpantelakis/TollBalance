# -----------------------------------------
# REST API FUNCTIONALITY ENDPOINTS QUERIES
# -----------------------------------------


/*
 * Toll Station Passes
 */

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
WHERE toll_id = 'NAO03'
	AND timestamp >= '2022-01-01'
	AND timestamp <= '2022-01-31';


/*
 * Pass Analysis
 */

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
	AND p.timestamp <= '2022-01-31';


/*
 * Passes Cost
 */

SELECT
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

SELECT
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
GROUP BY p.tag_operator_id;


# ---------------------------------
# Toll Balance Database DDL script
# ---------------------------------


/*
 * Create the database
 */

DROP DATABASE IF EXISTS toll_balance;
CREATE DATABASE toll_balance;
USE toll_balance;
SET GLOBAL event_scheduler = ON;


/*
 * Create the tables
 */

CREATE TABLE operators (
  id VARCHAR(4) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE debts (
  id INT NOT NULL AUTO_INCREMENT,
  debtor VARCHAR(4) NOT NULL,
  creditor VARCHAR(4) NOT NULL,
  amount FLOAT NOT NULL,
  date_created DATE NOT NULL,
  date_paid DATE DEFAULT NULL,
  settled boolean NOT NULL DEFAULT FALSE,
  verified boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  KEY FK_Debts_Debtor (debtor),
  KEY FK_Debts_Creditor (creditor),
  CONSTRAINT FK_Debts_Debtor FOREIGN KEY (debtor) REFERENCES operators (id) ON UPDATE CASCADE,
  CONSTRAINT FK_Debts_Creditor FOREIGN KEY (creditor) REFERENCES operators (id) ON UPDATE CASCADE
);

CREATE TABLE roads (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE operators_roads (
  op_id VARCHAR(4) NOT NULL,
  road_id INT NOT NULL,
  PRIMARY KEY (op_id, road_id),
  KEY FK_Operators_Roads_RoadID (road_id),
  CONSTRAINT FK_Operators_Roads_RoadID FOREIGN KEY (road_id) REFERENCES roads (id) ON UPDATE CASCADE,
  CONSTRAINT FK_Operators_Roads_OperatorID FOREIGN KEY (op_id) REFERENCES operators (id) ON UPDATE CASCADE
);

CREATE TABLE toll_stations (
  id VARCHAR(10) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  name VARCHAR(255) NOT NULL,
  locality VARCHAR(255) NOT NULL,
  road_id INT NOT NULL,
  type VARCHAR(2) NOT NULL,
  op_id VARCHAR(4) NOT NULL,
  price1 FLOAT NOT NULL,
  price2 FLOAT NOT NULL,
  price3 FLOAT NOT NULL,
  price4 FLOAT NOT NULL,
  PRIMARY KEY (id),
  KEY FK_Tolls_OperatorID (op_id),
  KEY FK_Tolls_RoadID (road_id),
  CONSTRAINT FK_Tolls_RoadID FOREIGN KEY (road_id) REFERENCES roads (id) ON UPDATE CASCADE,
  CONSTRAINT FK_Tolls_OperatorID FOREIGN KEY (op_id) REFERENCES operators (id) ON UPDATE CASCADE
);

CREATE TABLE toll_passes (
  id INT NOT NULL AUTO_INCREMENT,
  timestamp DATETIME NOT NULL,
  toll_id VARCHAR(10) NOT NULL,
  tag_operator_id VARCHAR(4) NOT NULL,
  tag_vehicle_ref_id VARCHAR(20) NOT NULL,
  charge FLOAT NOT NULL,
  PRIMARY KEY (id),
  KEY FK_Toll_Pass_TollID (toll_id),
  KEY FK_Toll_Pass_TagOperatorID (tag_operator_id),
  CONSTRAINT FK_Toll_Pass_TagOperatorID FOREIGN KEY (tag_operator_id) REFERENCES operators (id) ON UPDATE CASCADE,
  CONSTRAINT FK_Toll_Pass_TollID FOREIGN KEY (toll_id) REFERENCES toll_stations (id) ON UPDATE CASCADE
);

CREATE TABLE admin (
	username VARCHAR(30),
    password VARCHAR(255),
    PRIMARY KEY (username,password)
);

CREATE TABLE months (
	month CHAR(7) PRIMARY KEY
);


/*
 * Create the triggers
 */

DELIMITER //

CREATE TRIGGER add_debt
AFTER INSERT
ON toll_passes
FOR EACH ROW
BEGIN
	IF NEW.tag_operator_id != (SELECT op_id FROM toll_stations WHERE id = NEW.toll_id) THEN
		IF EXISTS (
			SELECT 1
			FROM debts
			WHERE date_created = NEW.timestamp
				AND debtor = NEW.tag_operator_id
				AND creditor = (
					SELECT op_id
					FROM toll_stations
					WHERE id = NEW.toll_id
				)
		) THEN
			UPDATE debts
			SET amount = amount + NEW.charge
			WHERE date_created = NEW.timestamp
				AND debtor = NEW.tag_operator_id
				AND creditor = (
					SELECT op_id
					FROM toll_stations
					WHERE id = NEW.toll_id
				);
		ELSE 
			INSERT INTO debts (debtor, creditor, amount, date_created)
			VALUES (
				NEW.tag_operator_id,
				(SELECT op_id FROM toll_stations WHERE id = NEW.toll_id),
				NEW.charge,
				NEW.timestamp
			);
		END IF;
	END IF;
END;
//

DELIMITER ;


/*
 * Create the events
 */
DELIMITER //

CREATE EVENT daily_month_update
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
	DECLARE new_month VARCHAR(7);
	SET new_month = DATE_FORMAT(CURDATE(), '%Y-%m');

	IF NOT EXISTS (
		SELECT 1
		FROM months
		WHERE month = new_month
	) THEN
		INSERT INTO months (month) VALUES (new_month);
	END IF;
END //

DELIMITER ;


/*
 * Create the procedures
 */

DELIMITER //

CREATE PROCEDURE populate_months()
BEGIN
	DECLARE start_date DATE;
	SET start_date = '2022-01-01';

	WHILE start_date <= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) DO
		INSERT INTO months (month) VALUES (DATE_FORMAT(start_date, '%Y-%m'));
		SET start_date = DATE_ADD(start_date, INTERVAL 1 MONTH);
	END WHILE;
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE view_all_credit_histories(IN loggedInId VARCHAR(4), IN startDate DATE, IN endDate DATE)
BEGIN
	SET @ops = NULL;

	SELECT
  		GROUP_CONCAT(
    			CONCAT(
				'ROUND(COALESCE(SUM(CASE WHEN d.debtor = ''', id, ''' THEN d.amount END), 0), 1) AS ', name, ''
    			)
  		) INTO @ops
	FROM operators
	WHERE id != loggedInId;
	
	SET @ops= CONCAT('
		SELECT
			m.month AS month,
			', @ops, '
		FROM months m
		LEFT JOIN debts d
		ON DATE_FORMAT(d.date_created, "%Y-%m") = m.month
			AND d.creditor = ''', loggedInId, '''
		WHERE m.month >= DATE_FORMAT(''', startDate, ''', "%Y-%m")
			AND m.month <= DATE_FORMAT(''', endDate, ''', "%Y-%m")
		GROUP BY m.month
		ORDER BY m.month DESC;
	');
	
	PREPARE stmt FROM @ops;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE view_all_debt_histories(IN loggedInId VARCHAR(4), IN startDate DATE, IN endDate DATE)
BEGIN
	SET @ops = NULL;

	SELECT
  		GROUP_CONCAT(
    			CONCAT(
				'ROUND(COALESCE(SUM(CASE WHEN d.creditor = ''', id, ''' THEN d.amount END), 0), 1) AS ', name, ''
    			)
  		) INTO @ops
	FROM operators
	WHERE id != loggedInId;
	
	SET @ops= CONCAT('
		SELECT
			m.month AS month,
			', @ops, '
		FROM months m
		LEFT JOIN debts d
		ON DATE_FORMAT(d.date_created, "%Y-%m") = m.month
			AND d.debtor = ''', loggedInId, '''
		WHERE m.month >= DATE_FORMAT(''', startDate, ''', "%Y-%m")
			AND m.month <= DATE_FORMAT(''', endDate, ''', "%Y-%m")
		GROUP BY m.month
		ORDER BY m.month DESC;
	');
	
	PREPARE stmt FROM @ops;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

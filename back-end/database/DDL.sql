# ---------------------------------
# Toll Balance Database DDL script
# ---------------------------------


/*
 * Create the database
 */

DROP DATABASE IF EXISTS toll_balance;
CREATE DATABASE toll_balance;
USE toll_balance;


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
  timestamp DATE NOT NULL,
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
 * Create the procedures
 */

DELIMITER //

CREATE PROCEDURE create_months(creditor_id VARCHAR(4), debtor_id VARCHAR(4), start_date DATE, end_date DATE)
BEGIN
	CREATE TEMPORARY TABLE IF NOT EXISTS months (
		month CHAR(7)
	);

	WHILE start_date <= end_date DO
		INSERT INTO months (month) VALUES (DATE_FORMAT(start_date, '%Y-%m'));
		SET start_date = DATE_ADD(start_date, INTERVAL 1 MONTH);
	END WHILE;

	SELECT 
		m.month AS month,
		ROUND(COALESCE(SUM(d.amount), 0), 1) AS totalDebts
	FROM months m
	LEFT JOIN debts d
	ON DATE_FORMAT(d.date_created, '%Y-%m') = m.month
		AND d.creditor = creditor_id
		AND d.debtor = debtor_id
	GROUP BY m.month
	ORDER BY m.month DESC;

	DROP TEMPORARY TABLE months;
END //

DELIMITER ;

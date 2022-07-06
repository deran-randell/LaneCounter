-- MySQL Script generated by MySQL Workbench
-- Mon Jul  4 12:52:07 2022
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mothdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mothdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mothdb` DEFAULT CHARACTER SET utf8 ;
USE `mothdb` ;

-- -----------------------------------------------------
-- Table `mothdb`.`LaneDevice`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mothdb`.`LaneDevice` (
  `lane_device_id` INT NOT NULL AUTO_INCREMENT,
  `lane_id` INT UNSIGNED NOT NULL,
  `device_id` VARCHAR(30) NOT NULL,
  `time_stamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lane_device_id`),
  UNIQUE INDEX `lane_device_id_UNIQUE` (`lane_device_id` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'Used to log when the system restarts, or a device counter restarts, or a device counter is replaced.';


-- -----------------------------------------------------
-- Table `mothdb`.`LaneCount`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mothdb`.`LaneCount` (
  `lane_count_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lane_id` TINYINT UNSIGNED NOT NULL,
  `time_stamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `moth_count` INT UNSIGNED NOT NULL,
  `moth_delta` INT UNSIGNED NOT NULL,
  `millis` INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX `IDX_LANE_ID` (`lane_id` ASC, `time_stamp` DESC) VISIBLE,
  PRIMARY KEY (`lane_count_id`),
  UNIQUE INDEX `lane_count_id_UNIQUE` (`lane_count_id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1;


-- -----------------------------------------------------
-- Table `mothdb`.`LaneTotal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mothdb`.`LaneTotal` (
  `lane_id` TINYINT UNSIGNED NOT NULL,
  `total` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `last_update` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lane_id`),
  UNIQUE INDEX `lane_id_UNIQUE` (`lane_id` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'Consists of 22 lane records.';


-- -----------------------------------------------------
-- Table `mothdb`.`LaneCountHistory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mothdb`.`LaneCountHistory` (
  `lane_id` TINYINT UNSIGNED NOT NULL,
  `time_stamp` TIMESTAMP NOT NULL,
  `moth_count` BIGINT UNSIGNED NOT NULL,
  `moth_delta` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`lane_id`, `time_stamp`))
ENGINE = InnoDB
COMMENT = 'Data for the last 3 months at 5 minute resolution';


-- -----------------------------------------------------
-- Table `mothdb`.`LaneCountArchive`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mothdb`.`LaneCountArchive` (
  `lane_id` TINYINT UNSIGNED NOT NULL,
  `time_stamp` TIMESTAMP NOT NULL,
  `moth_count` BIGINT UNSIGNED NOT NULL,
  `moth_delta` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`lane_id`, `time_stamp`))
ENGINE = InnoDB
COMMENT = 'Data with 1 hour resolution';

USE `mothdb` ;

-- -----------------------------------------------------
-- function CurrentLaneTotal
-- -----------------------------------------------------

DELIMITER $$
USE `mothdb`$$
CREATE FUNCTION CurrentLaneTotal (
LaneId TINYINT
)
RETURNS BIGINT
READS SQL DATA
DETERMINISTIC
BEGIN
	DECLARE MothTotal BIGINT;
    SELECT IFNULL(total, 0) INTO MothTotal FROM LaneTotal WHERE lane_id = LaneId;
    RETURN IFNULL(MothTotal,0);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- function CurrentLaneDevice
-- -----------------------------------------------------

DELIMITER $$
USE `mothdb`$$
CREATE FUNCTION CurrentLaneDevice (
	LaneId TINYINT
)
RETURNS VARCHAR(30)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE DeviceId VARCHAR(30);
    SELECT device_id INTO DeviceId FROM LaneDevice WHERE lane_id = LaneId ORDER BY time_stamp DESC LIMIT 1;
    RETURN DeviceId;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure DoMothHistoryMove
-- -----------------------------------------------------

DELIMITER $$
USE `mothdb`$$
CREATE PROCEDURE DoMothHistoryMove ()
BEGIN
    /* Select data from LaneCount into LaneCountHistory */
    /* To update the time resolution, adjust denominator in "timekey" field  */
	INSERT INTO LaneCountHistory
	(
		lane_id,
		time_stamp,
		moth_count,
		moth_delta
	)
	SELECT lane_id, time_stamp,	moth_count,	moth_delta FROM (
		SELECT 
			lane_id, 
			(MAX(time_stamp) + INTERVAL 1 second) AS time_stamp,
			SUM(moth_count) AS moth_count,
			SUM(moth_delta) AS moth_delta,  
			FLOOR(UNIX_TIMESTAMP(time_stamp)/(5 * 60)) AS timekey 
		FROM LaneCount 
		GROUP BY lane_id, timekey) AS temp;    
        
    /* Export data to file before deleting  */    
	SET @sql_text = CONCAT(
		  "SELECT * FROM mothdb.lanecount INTO OUTFILE ",
		  "'C://ProgramData/MySQL/MySQL Server 8.0/Uploads/mothdb/lanecount_", 
		  DATE_FORMAT(CURRENT_TIMESTAMP,"%Y%m%d_%H%i%s"),
		  "'");
	PREPARE s1 FROM @sql_text;
	EXECUTE s1;
	DROP PREPARE s1;  
    
    TRUNCATE TABLE LaneCount;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure DoMothArchiveMove
-- -----------------------------------------------------

DELIMITER $$
USE `mothdb`$$
CREATE PROCEDURE DoMothArchiveMove()
BEGIN
    /* Select data older than 90 days from LaneCountHistory into LaneCountArchive */
    /* To adjust the time period, change the INTERVAL 90 DAY in each of the 3 steps */
	INSERT INTO LaneCountArchive
	(
		lane_id,
		time_stamp,
		moth_count,
		moth_delta
	)
    SELECT 
		lane_id, 
		(MAX(time_stamp) + INTERVAL 1 second) AS time_stamp,
		SUM(moth_count) as moth_count,
		SUM(moth_delta) AS moth_delta
	FROM LaneCountHistory
    WHERE time_stamp < (NOW() - INTERVAL 90 DAY)
	GROUP BY lane_id, DAY(time_stamp), HOUR(time_stamp);
    
    /* Export data to file before deleting  */    
	SET @sql_text = CONCAT(
		  "SELECT * FROM mothdb.lanecounthistory WHERE time_stamp < (NOW() - INTERVAL 90 DAY) INTO OUTFILE ",
		  "'C://ProgramData/MySQL/MySQL Server 8.0/Uploads/mothdb/lanecounthistory_", 
		  DATE_FORMAT(CURRENT_TIMESTAMP,"%Y%m%d_%H%i%s"),
		  "'");
	PREPARE s1 FROM @sql_text;
	EXECUTE s1;
	DROP PREPARE s1;  
    
    /* Remove data older than 90 days*/
    DELETE FROM mothdb.lanecounthistory WHERE time_stamp < (NOW() - INTERVAL 90 DAY);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure InitLaneTotals
-- -----------------------------------------------------

DELIMITER $$
USE `mothdb`$$
CREATE PROCEDURE `InitLaneTotals` ()
BEGIN
	DECLARE counter int unsigned default 1;

    START TRANSACTION;
    WHILE counter < 23 do
		INSERT INTO LaneTotal (lane_id, total, last_update) VALUES (counter, 0, CURRENT_TIMESTAMP());
		SET counter = counter + 1;
    END WHILE;
	COMMIT;
END$$

DELIMITER ;
USE `mothdb`;

DELIMITER $$
USE `mothdb`$$
CREATE DEFINER = CURRENT_USER TRIGGER `mothdb`.`LaneCount_AFTER_INSERT` AFTER INSERT ON `LaneCount` FOR EACH ROW
BEGIN	
	UPDATE LaneTotal SET total = total + NEW.moth_delta, last_update = NEW.time_stamp WHERE lane_id = NEW.lane_id;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

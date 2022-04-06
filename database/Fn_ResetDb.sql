# Empty and reset the MothDB tables

SET SQL_SAFE_UPDATES = 0;

UPDATE mothdb.lanetotal SET total = 0;

# truncate resets auto increment
TRUNCATE TABLE mothdb.lanedevice; 
TRUNCATE TABLE mothdb.lanecount;

SET SQL_SAFE_UPDATES = 1;
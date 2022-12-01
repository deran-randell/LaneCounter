const db = require('./db');
const config = require('../config');
const helper = require('./helper');

async function getLaneDataWithPagination(laneId, page = 1){
  try {
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      "SELECT * FROM lanecount WHERE lane_id = ? LIMIT ?,?",
      [laneId, offset,  config.listPerPage]
    );

    const data = helper.emptyOrRows(rows);
    const meta = {page};

    return {
      data,
      meta
    }
  } 
  catch (error) {
    console.log("Error in getLaneDataWithPagination() " + error);    
  }
}

// Initial fetch from LaneDetail page - when opened or time period selection changes
// Thereafter, getLaneUpdate
async function getLaneData(laneId, minutes) {
  try {

    let sql_string = "";
    let aggregate_seconds = 0;

    switch (minutes) {
      case "0":
        aggregate_seconds = 60;
        break;
      case "1":
        break;
      case "10":
        break;
      case "30":
        aggregate_seconds = 2;
        break;
      case "60":
        aggregate_seconds = 4;
        break;
      case "180":
        aggregate_seconds = 10;
        break;
      case "360":
        aggregate_seconds = 30;
        break;
      case "720":
        aggregate_seconds = 30;
        break;
    }

    let time_str = "";
    if (minutes !== "0") {
      time_str = "AND time_stamp > (NOW() - INTERVAL " + minutes + " MINUTE) ";
    }

    if (aggregate_seconds !== 0)
    {
      sql_string = 
        "SELECT UNIX_TIMESTAMP(time_stamp) AS unix_timestamp,	moth_delta FROM (" +
          "SELECT" + 
            "(MAX(time_stamp) + INTERVAL 1 second) AS time_stamp, " + 
            "SUM(moth_delta) AS moth_delta, " + 
            "FLOOR(UNIX_TIMESTAMP(time_stamp)/(" + aggregate_seconds + ")) AS timekey " +  
          "FROM LaneCount " + 
          "WHERE lane_id = ? " + time_str +
          "GROUP BY lane_id, timekey) AS temp " +
          "ORDER BY time_stamp ASC";       
        }
    else {      
      sql_string = 
        "SELECT UNIX_TIMESTAMP(time_stamp) AS unix_timestamp, moth_delta FROM lanecount " +
        "WHERE lane_id = ? " + time_str +
        "ORDER BY time_stamp ASC";       
    }

    const rows = await db.query(sql_string, [laneId]);

    data = helper.emptyOrRows(rows);

    return {
      data
    }
  } 
  catch (error) {
    console.log("Error in getLaneData() " + error);    
  }
}

async function addLaneData(laneId, count, delta, millis, time_stamp, sensor_states,) {
  if (!sensor_states)
  {
    sensor_states = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  try {
    const result = await db.query("INSERT INTO lanecount (lane_id, moth_count, moth_delta, millis, time_stamp, sensor_states) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), ?)",
    [laneId, count, delta, millis, time_stamp, sensor_states]);

    if (result.affectedRows == 0) {
      throw new Error("Error inserting moth count for lane " + laneId);
    }
    
  } 
  catch (error) {
    console.log("Error in addLaneData() " + error);    
  }
}

module.exports = {
    getLaneData,
    addLaneData
}
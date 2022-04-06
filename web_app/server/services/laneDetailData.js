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

async function getLaneData(laneId) {
  try {
    const rows = await db.query(
      "SELECT UNIX_TIMESTAMP(time_stamp) AS unix_timestamp, moth_delta FROM lanecount WHERE lane_id = ? ORDER BY time_stamp ASC",
      [laneId]
    );

    const data = helper.emptyOrRows(rows);

    return {
      data
    }
  } 
  catch (error) {
    console.log("Error in getLaneData() " + error);    
  }
}

async function addLaneData(laneId, count, delta, millis, time_stamp) {
  try {
    const result = await db.query("INSERT INTO lanecount (lane_id, moth_count, moth_delta, millis, time_stamp) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))",
    [laneId, count, delta, millis, time_stamp]);

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
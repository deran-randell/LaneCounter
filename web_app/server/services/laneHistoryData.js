const db = require('./db');
const config = require('../config');
const helper = require('./helper');

async function getLaneHistory(laneId) {
  try {

    const rows = await db.query(
      "SELECT UNIX_TIMESTAMP(time_stamp) AS unix_timestamp, moth_delta FROM lanecounthistory " +
      "WHERE lane_id = ? " +
      "ORDER BY time_stamp ASC",
      [laneId]
    );

    data = helper.emptyOrRows(rows);

    return {
      data
    }
  } 
  catch (error) {
    console.log("Error in getLaneData() " + error);    
  }
}

/*
async function getLaneWithPagination(laneId, page = 1){
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
*/

module.exports = {
    getLaneHistory
}
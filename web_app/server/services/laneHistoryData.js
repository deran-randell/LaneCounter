const db = require('./db');
const config = require('../config');
const helper = require('./helper');

async function getLaneHistory(laneId, months)
{
  try
  {
    // months: 1 = 1 month, 2 = 2 months, 3 = 3 months

    let time_str = "";
    switch (months)
    {
      case "1":
        time_str = "AND time_stamp > (CURDATE() - INTERVAL 30 DAY) ";
        break;
      case "2":
        time_str = "AND time_stamp > (CURDATE() - INTERVAL 60 DAY) ";
        break;
      case "3": // all data in the LaneCountHistory table
        break;
    }

    const rows = await db.query(
      "SELECT UNIX_TIMESTAMP(time_stamp) AS unix_timestamp, moth_delta FROM lanecounthistory " +
      "WHERE lane_id = ? " + time_str +
      "ORDER BY time_stamp ASC",
      [ laneId ]
    );

    data = helper.emptyOrRows(rows);

    return {
      data
    }
  }
  catch (error)
  {
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
const db = require('./db');
const helper = require('./helper');

async function getSensorStatesData(laneId, timePeriod)
{
  try
  {
    // timePeriod: 0 = today (since midnight), 1 = history (last 3 months), 2 = older (archive)

    let time_str = "";
    switch (timePeriod)
    {
      case "0":
        time_str = "AND time_stamp > (timestamp(current_date())) ";
        break;
      case "1":
        time_str = "AND time_stamp < (timestamp(current_date())) AND time_stamp > (CURDATE() - INTERVAL 90 DAY)";
        break;
      case "2":
        time_str = "AND time_stamp < (CURDATE() - INTERVAL 90 DAY) ";
        break;
    }

    const rows = await db.query(
      "SELECT UNIX_TIMESTAMP(time_stamp) AS unix_timestamp, device_id, sensor_state, sensor_number FROM sensorstates " +
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
    console.log("Error in getSensorStatesData() " + error);
  }
}

module.exports = {
  getSensorStatesData
}
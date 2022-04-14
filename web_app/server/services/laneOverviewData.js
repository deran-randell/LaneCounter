const laneManagement = require('./laneManagement');

/*
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}
*/

function getLaneOverviewData(laneId) {
  try {
    
    //const delta = between(1,100);

    let data = {
        "total": laneManagement.mothLanes[laneId-1].total, 
        "last_update": laneManagement.mothLanes[laneId-1].timestamp,
        "device": laneManagement.mothLanes[laneId-1].device,
        "last_delta": laneManagement.mothLanes[laneId-1].delta,
        "connected": laneManagement.mothLanes[laneId-1].is_receiving_data()
    };

    return {data}
  } 
  catch (error) {
    console.log("Error in getLaneOverviewData() " + error);    
  }
}
 
module.exports = {
    getLaneOverviewData,
}
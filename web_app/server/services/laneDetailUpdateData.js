const laneManagement = require('./laneManagement');

function getLaneDetailUpdate(laneId, seconds) {
  try {
    let data = [];

    // get data for the specified number of seconds from the history array for the lane
    // history data is stored latest first, so need to reverse it before sending
    if (laneManagement.mothLanes[laneId-1].history.size() >= seconds) {
      data = laneManagement.mothLanes[laneId-1].history.get(0,seconds-1);  
    }
    else {
      data = laneManagement.mothLanes[laneId-1].history.get(0,laneManagement.mothLanes[laneId-1].history.size()-1);
    }

    data.reverse();
    return {data}
  } 
  catch (error) {
    console.log("Error in getLaneDetailUpdate() " + error);    
  }
}
 
module.exports = {
    getLaneDetailUpdate,
}
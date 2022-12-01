const CircularBuffer = require("circular-buffer");
const db = require("./db");
const laneData = require("./laneDetailData");
const { MothLane } = require("./mothLaneClass");

const LaneCount = 22;
var initialised = false;

const state = {
  none: 0,
  calibration_started: 1,
  calibration_completed: 2,
  cleaning_started: 3,
  cleaning_stopped: 4,
};

// NOTE: Simple array is more efficient
// NOTE: Literal array initialisation this way is apparently better than empty array then looping
const d = new Date();
const m = d.getTime(); // returns milliseconds since the epoch, a number value
var mothLanes = [
  new MothLane(1, m), new MothLane(2, m), new MothLane(3, m), new MothLane(4, m),
  new MothLane(5, m), new MothLane(6, m), new MothLane(7, m), new MothLane(8, m),
  new MothLane(9, m), new MothLane(10, m), new MothLane(11, m), new MothLane(12, m),
  new MothLane(13, m), new MothLane(14, m), new MothLane(15, m), new MothLane(16, m),
  new MothLane(17, m), new MothLane(18, m), new MothLane(19, m),
  new MothLane(20, m), new MothLane(21, m), new MothLane(22, m),
];

initialiseMothCounter();

// Read from the database to initialise the current moth total per lane
// LaneTotal table MUST be initialised for all 22 lanes
async function initialiseMothCounter()
{
  if (!initialised)
  {
    for (let i = 0; i < 3; i++)
    {
      // Get the current cumulative total number of moths for the lane
      let result = await getLaneTotal(i + 1);
      mothLanes[ i ].total = result.total;

      // Get the current device description for the lane
      let result2 = await getCurrentLaneDevice(i + 1);
      if (Boolean(result2.device))
      {
        mothLanes[ i ].device = result2.device;
      } else
      {
        console.log("Device for lane " + (i + 1) + " not found");
      }

      // Get the last data entered in the LaneCount table for the lane
      await getLastLaneData(i + 1);

      console.log("Lane " + (i + 1) + ": total=" + mothLanes[ i ].total + ", count=" + mothLanes[ i ].count + ", millis=" + mothLanes[ i ].millis + ", sensor_states=" + mothLanes[ i ].sensor_states + ", timestamp=" + mothLanes[ i ].timestamp);

      // Initialise the buffer with the last captured values
      mothLanes[ i ].add_history();
    }

    initialised = true;
  }
}

async function getLaneTotal(lane_id)
{
  try
  {
    const rows = await db.query("SELECT CurrentLaneTotal(?) AS Total", [ lane_id ]);
    let total = 0;
    if (rows.length > 0)
    {
      total = rows[ 0 ].Total;
    }

    return { total };
  } catch (error)
  {
    console.log("Error in getLaneDeviceTotal: " + error);
  }
}

async function getLastLaneData(lane_id)
{
  try
  {
    const rows = await db.query("SELECT moth_count, millis, UNIX_TIMESTAMP(time_stamp) AS unix_timestamp FROM LaneCount WHERE lane_id = ? ORDER BY time_stamp DESC LIMIT 1", [ lane_id ]);

    if (rows.length > 0)
    {
      mothLanes[ lane_id - 1 ].count = rows[ 0 ].moth_count;
      mothLanes[ lane_id - 1 ].millis = rows[ 0 ].millis;
      let time_stamp = rows[ 0 ].unix_timestamp;
      mothLanes[ lane_id - 1 ].timestamp = time_stamp * 1000;
    }
  } catch (error)
  {
    console.log("Error in getLastLaneUpdate: " + error);
  }
}

async function getCurrentLaneDevice(lane_id)
{
  try
  {
    const rows = await db.query("SELECT CurrentLaneDevice(?) AS Device", [ lane_id ]);

    let device = "";
    if (rows.length > 0)
    {
      device = rows[ 0 ].Device;
    }

    return { device };
  } catch (error)
  {
    console.log("Error in getCurrentLaneDevice: " + error);
  }
}

// Main function that gets called when data is received from a lane device
function updateDataForLane(lane_id, lane_data)
{
  try
  {
    if (initialised)
    {
      const i = lane_id - 1;

      // Add timestamp here to get consistency across tables
      let previous_timestamp = mothLanes[ i ].timestamp;
      let current_date = new Date();
      mothLanes[ i ].timestamp = current_date.getTime();

      // Edge case: first time in
      if (mothLanes[ i ].total === 0 && !mothLanes[ i ].active)
      {
        console.log("Lane" + lane_id + " FIRST TIME IN");
        addLaneDevice(lane_id, lane_data.device_id); // updates mothLanes[i].device
        addCountForLane(lane_id, lane_data.moth_count, lane_data.moth_count, lane_data.timestamp, lane_data.sensor_states); // updates total, count, delta, etc
      }
      // Not first time in, do others
      else
      {
        let do_same_device_restart_check = false;
        let add_device = false;

        if (!mothLanes[ i ].active)
        {
          // System was restarted
          // convert device id to string no padding and compare
          if (lane_data.device_id.toString().trim() !== mothLanes[ i ].device.toString().trim())
          {
            // Device has changed
            console.log("Restart: Lane" + lane_id + " device has changed");
            addLaneDevice(lane_id, lane_data.device_id); // updates mothLanes[i].device
            addCountForLane(lane_id, lane_data.moth_count, lane_data.moth_count, lane_data.timestamp, lane_data.sensor_states); // updates total, count, delta, etc
          } else
          {
            // Device the same
            console.log("Restart: Lane" + lane_id + " device the same");
            do_same_device_restart_check = true;
            // Insert into the devices table to register the software restart, even if the device didn't restart
            addLaneDevice(lane_id, lane_data.device_id); // Updates mothLanes[i].device
          }
        } else
        {
          // System has processed at least 1 message for this lane
          if (lane_data.device_id !== mothLanes[ i ].device)
          {
            // Device has changed
            console.log("Lane" + lane_id + " device has changed");
            addLaneDevice(lane_id, lane_data.device_id); // updates mothLanes[i].device
            addCountForLane(lane_id, lane_data.moth_count, lane_data.moth_count, lane_data.timestamp, lane_data.sensor_states); // updates total, count, delta, etc
          } else
          {
            // Device the same
            do_same_device_restart_check = true;
            add_device = true;
          }
        }

        if (do_same_device_restart_check)
        {
          // Now decide whether the device was restarted since the last update, or a millis rollover happened
          let reset_rollover = mothLanes[ i ].did_reset(lane_data.timestamp, previous_timestamp, lane_data.moth_count);

          // Ignore minor negative moth counts... updat to prevent MySQL error as column is unsigned INT
          if (reset_rollover.ignore_count)
          {
            lane_data.moth_count = mothLanes[ i ].count;
          }

          if (reset_rollover.reset)
          {
            // Device reset, so count and millis will have started from zero again
            if (add_device)
            {
              addLaneDevice(lane_id, lane_data.device_id); // updates mothLanes[i].device
            }
            addCountForLane(lane_id, lane_data.moth_count, lane_data.moth_count, lane_data.timestamp); // updates total, count, delta, etc
          } else if (reset_rollover.count_rollover)
          {
            // Doesn't matter if millis did rollover
            addCountForLane(lane_id, lane_data.moth_count, lane_data.moth_count, lane_data.timestamp);
            addSensorState(lane_id, lane_data.device_id, lane_data.sensor_states);
          } else
          {
            // Normal update, even if millis did rollover
            addCountForLane(lane_id, lane_data.moth_count, lane_data.moth_count - mothLanes[ i ].count, lane_data.timestamp, lane_data.sensor_states); // updates total, count, delta, etc
            addSensorState(lane_id, lane_data.device_id, lane_data.sensor_states);
          }
        }
      }

      mothLanes[ i ].active = true;
    }
  } catch (error)
  {
    console.log("Error in updateDataForLane: " + error);
  }
}

function addCountForLane(lane_id, count, delta, millis, sensor_states)
{
  try
  {
    const i = lane_id - 1;
    mothLanes[ i ].total += delta;
    mothLanes[ i ].delta = delta;
    mothLanes[ i ].count = count;
    mothLanes[ i ].millis = millis;
    mothLanes[ i ].sensor_states = sensor_states;

    mothLanes[ i ].add_history();
    // The LaneCount table has a trigger to update the LaneTotal table after insert
    let time_stamp = mothLanes[ i ].timestamp / 1000;
    laneData.addLaneData(lane_id, count, delta, millis, time_stamp, sensor_states);
  } catch (error)
  {
    console.log("Error in addCountForLane " + error);
  }
}

async function addLaneDevice(laneId, deviceId)
{
  try
  {
    let time_stamp = mothLanes[ laneId - 1 ].timestamp / 1000;
    const result = await db.query("INSERT INTO lanedevice (lane_id, device_id, time_stamp) VALUES (?, ?, FROM_UNIXTIME(?))", [ laneId, deviceId, time_stamp ]);

    if (result.affectedRows == 0)
    {
      throw new Error("Error inserting device " + deviceId + " for lane " + laneId);
    }

    mothLanes[ laneId - 1 ].device = deviceId;
  } catch (error)
  {
    console.log("Error in addLaneDevice() " + error);
  }
}

function checkState(sensor_states)
{
  let sensor_number = -1;
  for (let i = 0; i < sensor_states.length; i++)
  {
    if (sensor_states[ i ] == state.calibration_started || sensor_states[ i ] == state.calibration_completed || sensor_states[ i ] == state.cleaning_started || sensor_states[ i ] == state.cleaning_stopped)
    {
      sensor_number = i;
    }
  }
  return sensor_number;
}

async function addSensorState(laneId, deviceId, sensor_states)
{
  let time_stamp = mothLanes[ laneId - 1 ].timestamp / 1000;
  let sensor_number = checkState(sensor_states);

  if (sensor_number != -1)
  {
    try
    {
      const result = await db.query("INSERT INTO sensorstates (lane_id, device_id, sensor_number, sensor_state, time_stamp) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))", [ laneId, deviceId, sensor_number + 1, sensor_states[ sensor_number ], time_stamp ]);

      if (result.affectedRows == 0)
      {
        throw new Error("Error inserting device " + deviceId + " for lane " + laneId);
      }
    } catch (error)
    {
      console.log("Error in addSensorState() " + error);
    }
  }
}

module.exports = {
  mothLanes,
  updateDataForLane,
};

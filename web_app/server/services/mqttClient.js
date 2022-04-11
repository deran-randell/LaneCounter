const laneManagement = require('../services/laneManagement');
const mqtt = require('mqtt');
const mqtt_client = mqtt.connect("mqtt://localhost", {clientId: "lanecounternode"});

var publish_count = 0;
var publish_date = new Date();

mqtt_client.on('connect', () => {
  console.log("Connected to Mosquitto Broker");

  for (let i = 1; i < 4; i++) {
    let topic = "lane" + i;
    mqtt_client.subscribe(topic, (err) => {
        if (err) {
            console.log("Error subscribing");
        }
    });  
  }

  // for testing only
  doFakePublish(1, 10000);
  doFakePublish(2, 10000);
  doFakePublish(3, 10000);
})

mqtt_client.on("error", (error) => {
  console.log("Can't connect" + error)
});

mqtt_client.on('message', (topic, message) => {
  switch (topic) {
    case 'lane1':
      return handleLaneData(1, message)
    case 'lane2':
      return handleLaneData(2, message)
    case 'lane3':
      return handleLaneData(3, message)
  }
  console.log("No handler for topic " + topic)
})

function handleLaneData (lane_id, message) {
  const data = JSON.parse(message);
  console.log("New Data for Lane " + lane_id + ": " + data.device_id + ", " + data.moth_count + ", " + data.timestamp);
  laneManagement.updateDataForLane(lane_id, data)
}

// For testing, publish as well as subscribe

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

function publishLaneCount (lane_id) {  
  if (mqtt_client.connected) {
    publish_count += between(1,100);
    const topic = "lane" + lane_id;
    let now = new Date();
    const millis = now.getTime() - publish_date.getTime(); // Arduino number of millseconds since the program was started
    const lane_device_id = "device " + lane_id;
    const data = {"device_id": lane_device_id, "moth_count": publish_count, "timestamp": millis};
    const dataJSON = JSON.stringify(data);
    mqtt_client.publish(topic, dataJSON);
  }
  else {
    console.log("Can't publish - not connected");
  }
}

function doFakePublish(lane_id, times) {
  if (times < 1) {
    return;
  }

  setTimeout(() => {
    publishLaneCount(lane_id);
    doFakePublish(lane_id, times-1);
  }, 1000);
}

function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
  }

  if (options.exit) {
    process.exit()
  }
}

process.on('exit', handleAppExit.bind(null, {
  cleanup: true}))

process.on('SIGINT', handleAppExit.bind(null, {
  exit: true}))

process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true}))

module.exports = mqtt_client;
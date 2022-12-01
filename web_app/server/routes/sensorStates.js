const express = require('express');
const router = express.Router();
const deviceData = require('../services/sensorStatesData');

router.get('/:lane_id/:time_period', async function(req, res, next) {
  try {
    
    res.json(await deviceData.getSensorStatesData(req.params.lane_id, req.params.time_period));
  } catch (err) {
    console.error("Error while getting device data ", err.message);
    next(err);
  }
});

module.exports = router;
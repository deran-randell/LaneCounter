const express = require('express');
const router = express.Router();
const laneData = require('../services/laneHistoryData');

router.get('/:lane_id/:months', async function(req, res, next) {
  try {
    res.json(await laneData.getLaneHistory(req.params.lane_id, req.params.months));
  } catch (err) {
    console.error("Error while getting lane history ", err.message);
    next(err);
  }
});

module.exports = router;
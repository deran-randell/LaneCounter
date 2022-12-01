const express = require('express');
const router = express.Router();
const laneData = require('../services/laneDetailData');

router.get('/:lane_id/:minutes', async function (req, res, next)
{
  try
  {
    res.json(await laneData.getLaneData(req.params.lane_id, req.params.minutes));
  } catch (err)
  {
    console.error("Error while getting lane data ", err.message);
    next(err);
  }
});

module.exports = router;


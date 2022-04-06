const express = require('express');
const router = express.Router();
const allData = require('../services/allLaneData');

router.get('/', async function(req, res, next) {
  try {
    res.json(await allData.getAllLaneData(req.query.page));
  } catch (err) {
    console.error("Error while getting all lane data ", err.message);
    next(err);
  }
});

module.exports = router;
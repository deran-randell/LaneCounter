var express = require("express");
var router = express.Router();
const laneOverview = require("../services/laneOverviewData");

router.get('/:lane_id', function(req, res, next) {
    try {
        //console.log(laneOverview.getLaneOverviewData(req.params.lane_id));
        //res.header("Access-Control-Allow-Origin", "*");
        res.json(laneOverview.getLaneOverviewData(req.params.lane_id));        
    } 
    catch (error) {
        console.log("Lane Overview GET error: " + error);    
    }
});

module.exports = router;
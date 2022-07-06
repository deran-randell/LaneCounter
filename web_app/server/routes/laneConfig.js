var express = require("express");
var router = express.Router();

router.get('/', function(req, res, next) {
    res.json({ message: "Lane Configuration - not yet implemented" });
});

module.exports = router;
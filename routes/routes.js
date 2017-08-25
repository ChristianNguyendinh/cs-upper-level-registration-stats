var express = require("express");
var router = express.Router({ mergeParams: true});
var api = require("./api.js");
var config = require("../config/settings.js");

router.get("/*", function(req, res, next) {
    // validate that the semester given is an actual semester code with data
    if (config.semesters.includes(req.params.semester)) {
        next();
    }
    else {
    	res.statusCode = 406;
        res.send("Invalid Semseter");
    }
});

router.get("/stats", api.stats);

router.get("/course/:name", api.singleCourse);

router.get("/:course/((\\d\\d-\\d\\d-\\d\\d_\\d\\d-\\d\\d-\\d\\d))", api.time);

router.get("/recent/:name", api.recent);

router.get("/courselist", api.list);

module.exports = router;
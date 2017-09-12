/*
Master router for non-trivial urls
*/

var express = require("express");
var router = express.Router({ mergeParams: true });
var api = require("./api.js");
var config = require("../config/settings.js");

// validate that the semester given is an actual semester code with data
router.get("/*", function(req, res, next) {
    if (config.semesters.includes(req.params.semester)) {
        next();
    }
    else {
        res.statusCode = 406;
        res.send("Invalid Semseter");
    }
});

// Pass the API routes off to the api routing file
router.get("/stats", api.stats);

router.get("/course/:name", api.singleCourse);

router.get("/:course/((\\d\\d-\\d\\d-\\d\\d_\\d\\d-\\d\\d-\\d\\d))", api.time);

router.get("/recent/:name", api.recent);

router.get("/courselist", api.list);

module.exports = router;
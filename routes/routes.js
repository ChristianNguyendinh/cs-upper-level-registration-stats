var express = require("express");
var router = express.Router({ mergeParams: true});
var api = require("./api.js");

router.get('/*', function(req, res, next) {
    // validate that the semester given is 
    var validSemsters = ["201701"];

    if (validSemsters.includes(req.params.semester))
        next();
    else
        res.send("Invalid Semseter")
});

router.get('/stats', api.stats);

router.get('/course/:name', api.singleCourse);

router.get('/:course/((\\d\\d\-\\d\\d\-\\d\\d\_\\d\\d\-\\d\\d\-\\d\\d))', api.time);

router.get('/recent/:name', api.recent);

router.get('/courselist', api.list);

module.exports = router;
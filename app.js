/*
Entry point for web application
*/

var express = require("express");
var server = express();
var bodyparser = require("body-parser");
var config = require("./config/settings.js");

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

// allow Cross Origin Requests
server.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    next();
});

// Get the most recent semester we have data for
server.get("/api/currentsemester", function(req, res) {
    res.json({ "currentSemester" : config.currentSemester });
});

// Get a list of all the semesters we have data for
server.get("/api/semesterlist", function(req, res) {
    res.json(config.semesters);
});

// API. Separated by semesters - 6 digit number - same as UMD semester codes
// Ex. 201701 = Spring 2017, 201612 = Winter 2016, 201508 = Fall 2015, 201405 = Winter 2014
server.use("/api/:semester(\\d{6})", require("./routes/routes.js"));

// Default port of 8000, can specify env var 'PORT' to change
server.set("port", (process.env.PORT || 3002));

server.listen(server.get("port"), function() {
    console.log("Server running on port " + server.get("port"));
});

// Export the server for integration tests
module.exports = server;


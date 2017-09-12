/*
Entry point for web application
*/

var express = require("express");
var server = express();
var path = require("path");
var bodyparser = require("body-parser");
var config = require("./config/settings.js");

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

// Set static paths (including d3)
server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "public")));
server.use("/scripts", express.static(path.join(__dirname, "/node_modules/d3/")));

// Home page
server.get("/", function(req, res) {
    res.render("index");
});

// Main page with querying and charts
server.get("/charts", function(req, res) {
    res.render("charts");
});

// About page. Goal, technology stack, etc.
server.get("/about", function(req, res) {
    res.render("about");
});

// A help page. It's pretty simple tho, not sure if needed
server.get("/help", function(req, res) {
    res.render("help");
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
server.set("port", (process.env.PORT || 8000));

server.listen(server.get("port"), function() {
    console.log("Server running on port " + server.get("port"));
});

// Export the server for integration tests
module.exports = server;


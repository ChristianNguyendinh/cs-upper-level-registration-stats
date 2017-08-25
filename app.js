var express = require("express");
var server = express();
var path = require("path");
var bodyparser = require("body-parser");
var config = require("./config/settings.js");

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "public")));
server.use("/scripts", express.static(path.join(__dirname, "/node_modules/chart.js/dist/")));
server.use("/scripts", express.static(path.join(__dirname, "/node_modules/d3/")));


server.get("/", function(req, res) {
    res.render("index");
});

server.get("/charts", function(req, res) {
    res.render("charts");
});

server.get("/about", function(req, res) {
    res.render("about");
});

server.get("/help", function(req, res) {
    res.render("help");
});

server.get("/api/currentsemester", function(req, res) {
    res.json({ "currentSemester" : config.currentSemester });
});

server.get("/api/semesterlist", function(req, res) {
    res.json(config.semesters);
});

server.use("/api/:semester(\\d{6})", require("./routes/routes.js"));

server.set("port", (process.env.PORT || 8000));

server.listen(server.get("port"), function() {
    console.log("Server running on port " + server.get("port"));
});

module.exports = server;
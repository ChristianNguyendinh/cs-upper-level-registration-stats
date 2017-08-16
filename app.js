var express = require("express");
var server = express();
var CronJob = require("cron").CronJob;
var getData = require("./scrape_data.js");
var path = require("path");
var bodyparser = require("body-parser");

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

server.get("/test", function(req, res) {
    res.render("test");
});

server.get("/about", function(req, res) {
    res.render("about");
});

server.get("/help", function(req, res) {
    res.render("help");
});

server.get("/api/semesterlist", function(req, res) {
    res.json(["201701"]);
});

server.use("/api/:semester(\\d{6})", require("./routes/routes.js"));

// Run scrape data at 11:55pm EST daily
var job = new CronJob({
    cronTime: "* 55 23 * * *",
    onTick: function() {
        getData();
    },
    start: false,
    timeZone: "America/New_York"
});

server.set("port", (process.env.PORT || 8000));

server.listen(server.get("port"), function() {
    job.start();
    console.log("Server running on port " + server.get("port"));
});
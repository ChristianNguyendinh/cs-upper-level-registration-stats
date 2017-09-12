/*
Routes for the API. URL validity has been verified at this point. Req.params.semester
has also been set and is good to use.
*/

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data/courses.db");

// get all data for all classes
exports.stats = function(req, res) {
    let data = {};
    db.serialize(() => {
        db.each("SELECT * FROM \"" + req.params.semester + "\";", (err, row) => {
            if (!err) {
                //course|section|open|total|waitlist|date
                if (!data.hasOwnProperty(row.course))
                    data[row.course] = {};

                if (!data[row.course].hasOwnProperty(row.section))
                    data[row.course][row.section] = [];

                let datapoint = {open: row.open, total: row.total, wait: row.waitlist, date: row.date};
                data[row.course][row.section].push(datapoint);
            }
        }, (err) => { 
            //console.log(data);
            if (!err)
                res.json(data);
        });
    });
};

// get all the data we have stored for a class
exports.singleCourse = function(req, res) {
    let data = {};
    let courseName = req.params.name.toUpperCase();
    data[courseName] = {};

    db.serialize(() => {
        db.each("SELECT * FROM \"" + req.params.semester + "\" WHERE course = ?;", [courseName], (err, row) => {
            if (!err) {
                if (!data[courseName].hasOwnProperty(row.section))
                    data[courseName][row.section] = [];

                data[courseName][row.section].push({open: row.open, total: row.total, wait: row.waitlist, date: row.date});
            }
        }, (err, rowc) => { 
            if (err || rowc == 0)
                res.json({error: {type: "courseNotFound", message: "course " + courseName + " not found!", trace: err}});
            else
                res.json(data);
        });
    });
};

// get data for a course, within a time range
exports.time = function(req, res) {

    var split = req.params["0"].split("_");
    var startDate = split[0];
    var endDate = split[1];
    var courseName = req.params["course"];

    let data = {};
    data[courseName] = {};

    db.serialize(() => {
        db.each("SELECT * FROM \"" + req.params.semester + "\" WHERE course = ? AND date >= ? AND date <= ?;", [courseName, startDate, endDate], (err, row) => {
            if (!data[courseName].hasOwnProperty(row.section))
                data[courseName][row.section] = [];

            data[courseName][row.section].push({open: row.open, total: row.total, wait: row.waitlist, date: row.date});
        
        }, (err) => { 
            if (!err)
                res.json(data);
        });
    });
};

// get info about a class for the most recent day of data added
exports.recent = function(req, res) {
    let data = {};
    let courseName = req.params.name.toUpperCase();
    let rDate = new Date(0);
    let dateString = "";

    db.serialize(() => {
        db.each("SELECT DISTINCT date FROM \"" + req.params.semester + "\" WHERE course = ?;", [courseName], (err, row) => {
            if (!err) {
                let queryDate = new Date(row.date);
                if (queryDate > rDate) {
                    rDate = queryDate;
                    dateString = row.date;
                }

            }
        }, (err, rowc) => { 
            if (err || rowc == 0)
                res.json({error: {type: "courseOrDateNotFound", message: "course " + courseName + " date went wrong!", trace: err}});
            else {
                db.each("SELECT * FROM \"" + req.params.semester + "\" WHERE course = ? AND date = ?", [courseName, dateString], (err, row) => {
                    if (!err) 
                        data[row.section] = {open: row.open, total: row.total, wait: row.waitlist, date: row.date};
                }, (err, rowc) => { 
                    if (err || rowc == 0)
                        res.json({error: {type: "courseNotFound", message: "course " + courseName + " not found! ", trace: err}});
                    else {
                        data["date"] = dateString;
                        res.json(data);
                    }
                });
            }
        });
    });
};

// send a list of courses we have data for
exports.list = function(req, res) {
    let data = [];
    db.serialize(() => {
        db.each("SELECT DISTINCT course FROM \"" + req.params.semester + "\" ORDER BY course ASC;", (err, row) => {
            if (!err) {
                // skip the column header
                if (row.course != "course")
                    // object with key value so autocomplete library can accept it
                    data.push({ value: row.course });
            }
        }, (err) => { 
            //console.log(data);
            if (!err)
                res.json(data);
        });
    });
};
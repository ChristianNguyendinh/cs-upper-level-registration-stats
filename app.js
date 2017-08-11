var express = require('express');
var server = express();
var CronJob = require('cron').CronJob;
var getData = require('./scrape_data.js');
var path = require('path');
var request = require('request');
var bodyparser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/courses.db');

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/chart.js/dist/')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/d3/')));


server.get('/index', function(req, res) {
    res.render('index');
});

server.get('/test', function(req, res) {
    res.render('test');
});


// get all data for all classes
server.get('/api/:semester(\\d{6})/stats', validateSemester, function(req, res) {
    let data = {};
    db.serialize(() => {
        db.each('SELECT * FROM \"' + req.params.semester + '\";', (err, row) => {
            if (!err) {
                //course|section|open|total|waitlist|date
                if (!data.hasOwnProperty(row.course))
                    data[row.course] = {};

                if (!data[row.course].hasOwnProperty(row.section))
                    data[row.course][row.section] = [];

                let datapoint = {open: row.open, total: row.total, wait: row.waitlist, date: row.date}
                data[row.course][row.section].push(datapoint);
            } else {
                console.log(err)
            }
        }, (err, rowc) => { 
            //console.log(data);
            res.json(data);
        });
    });
});

// get all the data we have stored for a class
server.get('/api/:semester(\\d{6})/course/:name', validateSemester, function(req, res) {
    let data = {};
    let courseName = req.params.name.toUpperCase();
    data[courseName] = {};

    db.serialize(() => {
        db.each('SELECT * FROM \"' + req.params.semester + '\" WHERE course = ?;', [courseName], (err, row) => {
            if (!err) {
                if (!data[courseName].hasOwnProperty(row.section))
                    data[courseName][row.section] = [];

                data[courseName][row.section].push({open: row.open, total: row.total, wait: row.waitlist, date: row.date});
            } else {
                console.log(err)
            }
        }, (err, rowc) => { 
            if (err || rowc == 0)
                res.json({error: {type: 'courseNotFound', message: 'course ' + courseName + ' not found!', trace: err}});
            else
                res.json(data);
        });
    });
});

// get data for a course, within a time range
server.get('/api/:semester(\\d{6})/:course/((\\d\\d\-\\d\\d\-\\d\\d\_\\d\\d\-\\d\\d\-\\d\\d))', validateSemester, function(req, res) {

    var split = req.params['0'].split("_");
    var startDate = split[0];
    var endDate = split[1];
    var courseName = req.params['course'];

    let data = {};
    data[courseName] = {};

    db.serialize(() => {
        db.each('SELECT * FROM \"' + req.params.semester + '\" WHERE course = ? AND date >= ? AND date <= ?;', [courseName, startDate, endDate], (err, row) => {
            if (!data[courseName].hasOwnProperty(row.section))
                data[courseName][row.section] = [];

            data[courseName][row.section].push({open: row.open, total: row.total, wait: row.waitlist, date: row.date});
        
        }, (err, rowc) => { 
            res.json(data);
        });
    });
});

// get info about a class for the most recent day of data added
server.get('/api/:semester(\\d{6})/recent/:name', validateSemester, function(req, res) {
    let data = {};
    let courseName = req.params.name.toUpperCase();
    let rDate = new Date(0);
    let dateString = "";

    db.serialize(() => {
        db.each('SELECT DISTINCT date FROM \"' + req.params.semester + '\" WHERE course = ?;', [courseName], (err, row) => {
            if (!err) {
                let queryDate = new Date(row.date);
                if (queryDate > rDate) {
                    rDate = queryDate;
                    dateString = row.date;
                }

            } else {
                console.log(err)
            }
        }, (err, rowc) => { 
            if (err || rowc == 0)
                res.json({error: {type: 'courseOrDateNotFound', message: 'course ' + courseName + ' date went wrong!', trace: err}});
            else {
                db.each('SELECT * FROM \"' + req.params.semester + '\" WHERE course = ? AND date = ?', [courseName, dateString], (err, row) => {
                    if (!err) 
                        data[row.section] = {open: row.open, total: row.total, wait: row.waitlist, date: row.date};
                    else
                        console.log(err);
                }, (err, rowc) => { 
                    if (err || rowc == 0)
                        res.json({error: {type: 'courseNotFound', message: 'course ' + courseName + ' not found! ', trace: err}});
                    else {
                        data['date'] = dateString;
                        res.json(data);
                    }
                });
            }
        });
    });
});

// send a list of courses we have data for
server.get('/api/:semester(\\d{6})/courselist', validateSemester, function(req, res) {
    let data = [];
    db.serialize(() => {
        db.each('SELECT DISTINCT course FROM \"' + req.params.semester + '\";', (err, row) => {
            if (!err) {
                // skip the column header
                if (row.course != "course")
                    // object with key value so autocomplete library can accept it
                    data.push({ value: row.course });
            } else {
                console.log(err)
            }
        }, (err, rowc) => { 
            //console.log(data);
            res.json(data);
        });
    });
});

function validateSemester(req, res, next) {
    var validSemsters = ["201701"];

    if (validSemsters.includes(req.params.semester))
        next();
    else
        res.send("Invalid Semseter")
}

// Run scrape data at 11:55pm EST daily
var job = new CronJob({
    cronTime: '* 55 23 * * *',
    onTick: function() {
        getData();
    },
    start: false,
    timeZone: 'America/New_York'
});

server.set('port', (process.env.PORT || 8000));

server.get('/', function(req, res) {
    res.send("Made it")
})

server.listen(server.get('port'), function() {
    job.start();
    console.log('Server running on port ' + server.get('port'));
});
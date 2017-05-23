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

server.get('/index', function(req, res) {
    res.render('index');
});

// get all data for all classes
// temporary until the node scripts are written that use the postgres db. after that query based on parameter class name
server.get('/api/stats', function(req, res) {
    let data = {};
    db.serialize(() => {
        db.each('SELECT * FROM test1', (err, row) => {
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
server.get('/api/:name', function(req, res) {
    let data = {};
    let courseName = req.params.name.toUpperCase();
    data[courseName] = {};

    db.serialize(() => {
        db.each('SELECT * FROM test1 WHERE course = \"' + courseName + '\"', (err, row) => {
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

// get info about a class for the most recent day of data added
server.get('/api/recent/:name', function(req, res) {
    let data = {};
    let courseName = req.params.name.toUpperCase();
    let rDate = new Date(0);
    let dateString = "";

    db.serialize(() => {
        db.each('SELECT DISTINCT date FROM test1 WHERE course = \"' + courseName + '\"', (err, row) => {
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
                db.each('SELECT * FROM test1 WHERE course = \"' + courseName + '\" AND date = \"' + dateString + '\"', (err, row) => {
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
    getData();
    console.log('Server running on port ' + server.get('port'));
});
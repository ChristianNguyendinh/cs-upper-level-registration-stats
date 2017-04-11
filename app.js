var express = require('express');
var server = express();
var CronJob = require('cron').CronJob;
var PythonShell = require('python-shell');
var nodemailer = require('nodemailer');
var email = require('./settings.js').email;
var path = require('path');
var request = require('request');
var bodyparser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('manual/courses.db');

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({
    extended: true
}));

server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'public')));
server.use('/scripts', express.static(path.join(__dirname, '/node_modules/chart.js/dist/')));

server.get('/index', function(req, res) {
    res.render('index', { name: req.params.name });
});

// Change to have section object then push to that.
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

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email.name,
        pass: email.pass
    }
});

let mailOptions = {
    from: '"CSUPPERLEVEL BOT" <' + email.name + '>', // sender address
    to: '<teeswizzle19@gmail.com>', // list of receivers
    subject: 'Data for ' + (new Date().toString().substring(4, 10)) + ' ✔', // Subject line
    text: 'placeholder', // plain text body
};

var job = new CronJob({
    cronTime: '* 55 23 * * *',
    onTick: function() {
        let m = "";
        // for now use the python script until someone writes it in node
        PythonShell.run('manual/scrape_to_test.py', function (err) {
            if (err) throw err;
            mailOptions.text = m;
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    return console.log("Error sending message " + err)
                }
                console.log("Data email sent");
            });
        }).on('message', function (message) {
            m += message + "\n";
        });
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
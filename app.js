var express = require('express');
var server = express();
var CronJob = require('cron').CronJob;
var PythonShell = require('python-shell');
var nodemailer = require('nodemailer');
var email = require('./settings.js').email;

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
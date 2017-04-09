var express = require('express');
var server = express();
var CronJob = require('cron').CronJob;
var PythonShell = require('python-shell');

var job = new CronJob({
	cronTime: '*/15 * * * * *',
	onTick: function() {
		console.log("tick tok");
		// for now use the python script until someone writes it in node
		PythonShell.run('manual/scrape_to_test.py', function (err) {
			if (err) throw err;
			console.log("done");
		}).on('message', function (message) {
			console.log(message);
		});;
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
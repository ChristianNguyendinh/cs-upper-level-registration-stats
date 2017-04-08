var express = require('express');
var server = express();

server.set('port', (process.env.PORT || 8000));

server.get('/', function(req, res) {
	res.send("Made it")
})

server.listen(server.get('port'), function() {
	console.log('Server running on port 8000');
});
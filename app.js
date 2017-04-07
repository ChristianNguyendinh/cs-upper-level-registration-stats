var express = require('express');
var server = express();

server.get('/', function(req, res) {
	res.send("Made it")
})

server.listen(8080, function() {
	console.log('Server running on port 8080');
});
var http = require('http');
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  	extended: true
})); 

app.get('/', function (req, res) {
  	res.send('Hello World!');
  	console.log('One / call was made');
})

app.get('/get_channel_plays', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /get_channel_plays call was made');
})

app.post('/add_play', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /add_play call was made');
})

app.post('/add_channel', function (req, res) {
	var name = req.body.name;
  	res.send('Hello World!');
  	console.log('One /add_channel call was made', name);
})

app.post('/add_performer', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /add_performer call was made');
})

app.post('/add_song', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /add_song call was made');
})

app.listen(5000, function () {
  	console.log('Example app listening on port 5000!')
})
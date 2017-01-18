var http = require('http');
var express = require('express')
var bodyParser = require('body-parser')
var jsonfile = require('jsonfile')

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


// Initiate the Json file that we will use as a database set up
// To do so, we use the module jsonfile which perfectly suits our needs

// Initiate the file with the song information
var file = 'songs.json'
var obj = {
	title: 		'Unknown',
	performer: 	'Unknown'
}
 
jsonfile.writeFileSync(file, obj)
jsonfile.readFile(file, function(err, obj) {
  console.log('The answer to the json call is:', obj)
});

// Initiate the performer file
var file = 'performer.json'
var obj = {
	performer: 	'performer'
}
 
jsonfile.writeFileSync(file, obj)
jsonfile.readFile(file, function(err, obj) {
  console.log('The answer to the json call is:', obj)
});

// Initiate the channel file
var file = 'channel.json'
var obj = {
	channel: 	'Unknown'
}
 
jsonfile.writeFileSync(file, obj)
jsonfile.readFile(file, function(err, obj) {
  console.log('The answer to the json call is:', obj)
});

// Initiate the plays file
var file = 'plays.json'
var obj = {name: 'd'}
 
jsonfile.writeFileSync(file, obj)
jsonfile.readFile(file, function(err, obj) {
  console.log('The answer to the json call is:', obj)
});

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// Set up our server application

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
	var performer 	= req.body.performer;
	var title 		= req.body.title;
	var channel 	= req.body.channel;
	var start 		= req.body.start;
	var end 		= req.body.end;
  	res.send('Hello World!');
  	console.log('One /add_play call was made', performer, title, channel, start, end);
})

app.post('/add_channel', function (req, res) {
	var name = req.body.name;
  	res.send('Hello World!');
  	console.log('One /add_channel call was made', name);
})

app.post('/add_performer', function (req, res) {
	var name = req.body.name;
  	res.send('Hello World!');
  	console.log('One /add_performer call was made', name);
})

app.post('/add_song', function (req, res) {
	var performer 	= req.body.performer;
	var title 		= req.body.title;
  	res.send('Hello World!');
  	console.log('One /add_song call was made', performer, title);
})

app.listen(5000, function () {
  	console.log('Example app listening on port 5000!')
})
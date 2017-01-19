var http = require('http');
var express = require('express')
var bodyParser = require('body-parser')

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Initiate JSON database using the module node-json-db

var JsonDB = require('node-json-db')
var db = new JsonDB("myDataBase", true, false);

db.delete("/");

// Declare default values
var default_title 		= "Unknown";
var default_date 		= new Date("January 2, 1900 00:00:00").toISOString();
var default_performer	= "Unknown"
var default_name 		= "Unknown"
var default_channel 	= "Unknown"

// Initiate the tree in our database

// myDataBase	--	Songs		--	Title
//								--	Performer
//				--	Channel		--	Name
//				--	Performer 	--	Name
// 				--	Plays 		--	Title
//								--	Start
//								--	End
//								--	Channel

// Initiate tree if needed and add default values
// Initiaite song array
db.push("/Songs[0]", {
	title: default_title, 
	performer: default_performer
}, true);
// Initiaite Performes array
db.push("/Performers[0]",{name: default_name}, true);
// Initiaite Channels array
db.push("/Channels[0]",{name: default_name}, true);
// Initiaite Plays array
db.push("/Plays[0]",{
	title: 		default_title, 
	performer: 	default_performer, 
	start: 		default_date, 
	end: 		default_date,
	channel: 	default_channel
}, true);

console.log(db.getData("/"));

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Define extra functions that will allow us to avoid duplicates when storing data

function containsName(Item, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].name === Item) {
            return true;
        }
    }

    return false;
}

function containsTitle(Item, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].title === Item) {
            return true;
        }
    }

    return false;
}

function containsPlay(Item, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if ( list[i].title + list[i].performer + list[i].channel + list[i].start === Item.title + Item.performer + Item.channel + Item.start) {
            return true;
        }
    }

    return false;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Define our server using the express module

var app = express()

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  	extended: true
})); 

app.listen(5000, function () {
  	console.log('Example app listening on port 5000!')
})

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Build all the methods needed for the POST requests

app.post('/add_play', function (req, res) {
	// Collect data from request
	var performer 	= req.body.performer;
	var title 		= req.body.title;
	var channel 	= req.body.channel;
	var start 		= req.body.start;
	var end 		= req.body.end;

	// Store play in db
	if(!containsPlay(req.body, db.getData("/Plays"))){
		try{db.push("/Plays[]",{
			title: 		title, 
			performer: 	performer, 
			start: 		start, 
			end: 		start,
			channel: 	channel}, true);}
		catch(error){console.log('Play insertion failed' + error);}
	}

	// See if performer is in our records. If not, add it.
	if(!containsName(performer, db.getData("/Performers"))){
  		try{db.push("/Performers[]",{name: performer}, true);}
  		catch(error){console.log('Performer insertion missed' + error);}
  	}

  	// See if song is in our records. If not, add it.
  	if(!containsTitle(title, db.getData("/Songs"))){
		try{db.push("/Songs[]",{title: title, performer: performer}, true);}
	  	catch(error){console.log('Title insertion missed' + error);}
	}

	// See if channel is in our records. If not, add it.
	if(!containsName(channel, db.getData("/Channels"))){
		try{db.push("/Channels[]",{name: channel}, true);}
		catch(error){console.log('Channel insertion missed' + error);}
	}

	// Send response
  	res.send('Hello World!');
})

app.post('/add_channel', function (req, res) {
	// Collect data from request
	var name = req.body.name;

	// Store play in db
	if(!containsName(name, db.getData("/Channels"))){
		try{db.push("/Channels[]",{name: name}, true);}
		catch(error){console.log('Channel insertion missed' + error);}
	}

	// Send response
  	res.send('Hello World!');
})

app.post('/add_performer', function (req, res) {
	// Collect data from request
	var name = req.body.name;

	// Store performer in db
  	if(!containsName(name, db.getData("/Performers"))){
  		try{db.push("/Performers[]",{name: name}, true);}
  		catch(error){console.log('Performer insertion missed' + error);}
  	}

  	// Send response
  	res.send('Hello World!');
})

app.post('/add_song', function (req, res) {
	// Collect data from request
	var performer 	= req.body.performer;
	var title 		= req.body.title;

	// Store song in db
	if(!containsTitle(title, db.getData("/Songs"))){
		try{db.push("/Songs[]",{title: title, performer: performer}, true);}
	  	catch(error){console.log('Title insertion missed' + error);}
	}

	// See if performer is in our records. If not, add it.
	if(!containsName(performer, db.getData("/Performers"))){
  		try{db.push("/Performers[]",{name: performer}, true);}
  		catch(error){console.log('Performer insertion missed' + error);}
  	}

	// Send response
  	res.send('Hello World!');
})

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Build all the methods needed for the GET requests - Includes setting up a query method


app.get('/get_channel_plays', function (req, res) {

	/*
    Get the plays for the a channel.

    The server should return something like this:

    {result: [
     {'performer': 'Performer1', 'title': 'Song1',
      'start': '2014-01-10T01:00:00',
      'end': '2014-01-10T01:03:00'],
     {'performer': 'Performer2', 'title': 'Song2',
      'start': '2014-01-01T03:00:00',
       'end': '2014-01-01T03:03:00'},...], code: 0}
    */ 

    // Gather variables from request
    var channel = req.query.channel;
    var start 	= req.query.start;
    var end 	= req.query.end;


    console.log(channel, start, end, start > end,
    	db.getData("/Plays").filter(function (el) 
    		{return (el.channel === channel && start < el.start && el.end < end)})
    );
     
  	res.send(db.getData("/Plays").filter(function (el) 
    		{return (el.channel === channel && start < el.start && el.end < end)}));
  	console.log('One /get_channel_plays call was made');
});

app.get('/get_song_plays', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /get_song_plays call was made');
  	console.log(db.getData("/"));
});

app.get('/get_top', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /get_top call was made');
  	console.log(db.getData("/"));
});


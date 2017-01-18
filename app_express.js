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
var default_Performer	= "Unknown"
var default_Name 		= "Unknown"
var default_Channel 	= "Unknown"

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
db.push("/Songs[0]", {
	Title: default_title, 
	Performer: default_Performer
}, true);
db.push("/Performers[0]",{Name: default_Name}, true);
db.push("/Channels[0]",{Name: default_Name}, true);
db.push("/Plays[0]",{
	Title: 		default_title, 
	Performer: 	default_Performer, 
	Start: 		default_date, 
	End: 		default_date,
	Channel: 	default_Channel
}, true);

console.log(db.getData("/"));

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Define an extra function that will allow us avoid duplicates when storing data

function containsName(Item, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].Name === Item) {
            return true;
        }
    }

    return false;
}

function containsTitle(Item, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].Title === Item) {
            return true;
        }
    }

    return false;
}

function containsPlay(Item, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if ( list[i].Title + list[i].Performer + list[i].Channel + list[i].Start === Item.title + Item.performer + Item.channel + Item.start) {
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

app.get('/', function (req, res) {
  	res.send('Hello World!');
  	console.log('One / call was made');
})

app.get('/get_channel_plays', function (req, res) {
  	res.send('Hello World!');
  	console.log('One /get_channel_plays call was made');
  	console.log(db.getData("/"));
})

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
			Title: 		title, 
			Performer: 	performer, 
			Start: 		start, 
			End: 		start,
			Channel: 	channel}, true);}
		catch(error){console.log('Play insertion failed' + error);}
	}

	// See if performer is in our records
	if(!containsName(performer, db.getData("/Performers"))){
  		try{db.push("/Performers[]",{Name: performer}, true);}
  		catch(error){console.log('Performer insertion missed' + error);}
  	}

  	// See if song is in our records
  	if(!containsTitle(title, db.getData("/Songs"))){
		try{db.push("/Songs[]",{Title: title, Performer: performer}, true);}
	  	catch(error){console.log('Title insertion missed' + error);}
	}

	// See if channel is in our records
	if(!containsName(channel, db.getData("/Channels"))){
		try{db.push("/Channels[]",{Name: channel}, true);}
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
		try{db.push("/Channels[]",{Name: name}, true);}
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
  		try{db.push("/Performers[]",{Name: name}, true);}
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
		try{db.push("/Songs[]",{Title: title, Performer: performer}, true);}
	  	catch(error){console.log('Title insertion missed' + error);}
	}

	// See if performer is in our records
	if(!containsName(performer, db.getData("/Performers"))){
  		try{db.push("/Performers[]",{Name: performer}, true);}
  		catch(error){console.log('Performer insertion missed' + error);}
  	}

	// Send response
  	res.send('Hello World!');
})

app.listen(5000, function () {
  	console.log('Example app listening on port 5000!')
})
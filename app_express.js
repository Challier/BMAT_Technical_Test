var http = require('http');
var express = require('express')
var bodyParser = require('body-parser')

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Initiate JSON database using the module node-json-db

var JsonDB = require('node-json-db')
var db = new JsonDB("myDataBase", true, false);


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

console.log('Initiate database...')

try{
	db.getData("/Songs")
	console.log('Songs already exist in db')
}
catch(error){
	db.push("/Songs[0]", {
		title: default_title, 
		performer: default_performer
	}, true);
	console.log('Song retrieve failed, new branch is created')
}
// Initiaite Performes array
try{
	test = db.getData("/Performers")
	console.log('Songs already exist in db')
}
catch(error){
	test = db.push("/Performers[0]",{name: default_name}, true);
	console.log('Performers retrieve failed, new branch is created')
}
// Initiaite Channels array
try{
	test = db.getData("/Channels")
	console.log('Channels already exist in db')
}
catch(error){
	db.push("/Channels[0]",{name: default_name}, true);
	console.log('Channels retrieve failed, new branch is created')
}
// Initiaite Plays array
try{
	test = db.getData("/Plays")[0]
	console.log('Plays already exist in db')
}
catch(error){
	db.push("/Plays[0]",{
		title: 		default_title, 
		performer: 	default_performer, 
		start: 		default_date, 
		end: 		default_date,
		channel: 	default_channel
	}, true);
	console.log('Plays retrieve failed, new branch is created')
}

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

function listCount_top(List, limit){
	/* Example input for plays_week
	[ { title: 'Song2', performer: 'Performer2' },
	  { title: 'Song2', performer: 'Performer2' },
	  { title: 'Song2', performer: 'Performer2' },
	  { title: 'Song2', performer: 'Performer2' },
	  { title: 'Söng3', performer: 'Pêrformer3' },
	  { title: 'Song1', performer: 'Performer1' },
	  { title: 'Song1', performer: 'Performer1' },
	  { title: 'Song2', performer: 'Performer2' } ]

  	output wanted: {'Song2': 5, 'Song3': 1, 'Song1':2} 
	*/
	var dict_count 	= new Object;

	List.forEach(function(element) {
		var key = element.title;
		if (key in dict_count){
			dict_count[key].count += 1;
		}
		else {
			dict_count[key] = {title: key, performer: element.performer, count: 1};
		}
	});


	list_count = new Array();
	for (var key in dict_count){
		list_count.push([key, dict_count[key].count]);
	} 

	function compare(a,b) {
	  if (a[1] < b[1])
	    return 1;
	  if (a[1] > b[1])
	    return -1;
	  return 0;
	}

	return [list_count.sort(compare).slice(0,limit), dict_count];
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Define our server using the express module
try{
	var app = express()

	app.use( bodyParser.json() );       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  	extended: true
	})); 
	app.listen(5000, function () {
	  	console.log('App listening on port 5000!')
	})
}
catch(error){
	console.log('Couldn\'t initiate the app');
}

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
			end: 		end,
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
// Build all the methods needed for the GET requests 

app.get('/get_channel_plays', function (req, res) {
	console.log('One /get_channel_plays call was made');
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
    var result 	= new Array()

    try{
		result 	= db.getData("/Plays")
			.filter(function (el) {return (el.channel === channel && start < el.start && el.end < end)})
			.map(function (el) {return {performer: el.performer, title: el.title, start: el.start, end: el.end}});

    	res.send({result: result, code: 0})
    	console.log("Records successfully retrieved");
    }
    catch(error)
    {
    	res.send({result: "", code: 1, errors: error})
    	console.log('There was an error in the records retrieval: ' + error);
    } 
});

app.get('/get_song_plays', function (req, res) {
	/*
    Check the plays for one particular song. Here the results should look like
    this:

    {result: [
     {'channel': 'channel1', 'start': '2014-01-10T01:00:00',
      'end': '2014-01-10T01:03:00'},
     {'channel': 'channel2', 'start': '2014-01-01T02:00:00',
      'end': '2014-01-01T02:03:00'}, ...], code: 0}
    */
  	console.log('One /get_song_plays call was made');

  	// Gather variables from request
  	var title 	= req.query.title;
  	var result 	= new Array()


  	try{
  		result 	= db.getData("/Plays")
  			.filter(function (el) {return (el.title === title)})
  			.map(function (el) {return {channel: el.channel, start: el.start, end: el.end}});
    	
    	res.send({result: result, code: 0});
    	console.log("Records successfully retrieved");
    }
    catch(error)
    {
    	res.send({result: "", code: 1, errors: error})
    	console.log('There was an error in the records retrieval: ' + error);
    } 
});

app.get('/get_top', function (req, res) {
	/*
	Here we expect a list of [performer, song, plays, previous plays, previous
    rank]. Previous ranks starts at 0. If the song was not in the list for the
    past, the previous rank should be null.

    {result: [
     {'performer': 'Performer1', 'title': 'Song1', 'rank': 0,
      'previous_rank': 2, 'plays': 1, 'previous_plays': 2},...],
     'code': 0}
	
	Arguments passed in query:
    { 
    	channels: '["Channel2", "Channel1"]',
  		start: '2014-01-08T00:00:00',
  		limit: '10' 
  	} 
	*/

	console.log('One /get_top call was made');

	// Gather variables from request
	var start 		= req.query.start
	var channels 	= req.query.channels
	var limit		= req.query.limit

  	try{
  		plays_week 		= db.getData("/Plays")
  			.filter(function (el) {return (Date.parse(start) < Date.parse(el.start) && Date.parse(el.start) < Date.parse(start) + 6.048e+8 && channels.indexOf(el.channel) > -1)})
  			.map(function (el) {return {title: el.title, performer: el.performer}});
  		plays_preweek 	= db.getData("/Plays")
  			.filter(function (el) {return (Date.parse(start) - 6.048e+8 < Date.parse(el.start) && Date.parse(el.start) < Date.parse(start) && channels.indexOf(el.channel) > -1)})
  			.map(function (el) {return {title: el.title, performer: el.performer}});
    	console.log("Records successfully retrieved");
    }
    catch(error)
    {
    	res.send({result: "", code: 1, errors: error})
    	console.log('There was an error in the records retrieval: ' + error);
    } 

    count = listCount_top(plays_week, limit);
    plays_week_count 	= count[0];
    dict_week 			= count[1];

    plays_preweek_count	= listCount_top(plays_preweek, limit)[0];

    var result 		= new Array();
    var len 		= Math.min(plays_week_count.length, limit)

    for (i = 0; i < len; i++) {

    	/* result: [
     {'performer': 'Performer1', 'title': 'Song1', 'rank': 0,
      'previous_rank': 2, 'plays': 1, 'previous_plays': 2},...] */
    	previous_rank	= null;
    	previous_plays 	= 0;
		title 			= plays_week_count[i][0];

		for (j = 0; j < len; j++) {
        	if (plays_preweek_count[j][0] === title) {
        		previous_rank 	= j;
        		previous_plays	= plays_preweek_count[j][1];
        	}
    	}

    	result.push({'performer': dict_week[title].performer, 'title': title, 'rank': i, 'previous_rank': previous_rank, 'plays': plays_week_count[i][1], 'previous_plays': previous_plays});

	};

	res.send({result: result, code: 0});

});


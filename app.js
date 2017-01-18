var http = require('http');
var express = require('express')

function onRequest(request, response){
	console.log('A user made a request' + request.url + request.method + request.performer);
	//console.log(request);
	//response.writeHead(200, ["Content-Type": "text/plain"]);
	response.write("Here is some data");
	response.end()
}

http.createServer(onRequest).listen(5000);
console.log("Server is now running...")
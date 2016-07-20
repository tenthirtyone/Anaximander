/*
Prior to this script csvtojson is used to convert the 
raw Anaximander data files into lines of json objects

This script reads two lines at a time from the listed
files and builds a trip object based on the Mongo
model. 

Instead of calling save() on the Trip model
I write it to a file. mongoimport is much faster
as a bulk operation than saving hundreds of 
thousands of models 1 at a time.

The final documents are in slices. mongoimport
only supports 16MB BSON documents. Even though
each document is tens of thousands of documents
the import process considers them 1 giant document
for the import

Noes: Mongo saves dates in UTC & the GeoJson format
is [Longitude, Latitude]. Important below and 
will come in to play later on the front end.

Dates withouth timezone information default to the
system timezone.

Odd number trip files will be trimmed

mongoimport --db Anaximander --collection trips --file Anaximander-raw-data-apr14.json0 --jsonArray

Author: Alex Sherbuck
*/

var fs = require("fs");
var mongoose = require('mongoose');
var Trip = require('./models/Trip.model.js');
var fileCount = 0;

var inFiles = [
	'./data/json/uber-raw-data-apr14.csv.json',
	'./data/json/uber-raw-data-may14.csv.json',
	'./data/json/uber-raw-data-jun14.csv.json',
	'./data/json/uber-raw-data-jul14.csv.json',
	'./data/json/uber-raw-data-aug14.csv.json',
	'./data/json/uber-raw-data-sep14.csv.json'
]

console.log("\n *STARTING* \n");


for (var i=0; i<inFiles.length; i++) {
	//Create a new output stream and start the json array
	//Copy its content to a var and convert it to json.
	fileCount = 0;
	var wstream = fs.createWriteStream(inFiles[i]+fileCount);
	wstream.write('[');
	var content = fs.readFileSync(inFiles[i]);
	var jsonContent = JSON.parse(content);
	console.log('%s is %s lines long', inFiles[i], jsonContent.length);
	
	//Parse the fiel
	// >1 for trip pairs only
	while (jsonContent.length>1) { 
		if (jsonContent.length % 1000 === 0) {
			console.log(jsonContent.length) // Status
		}
		var pickup = jsonContent.pop();
		var dropoff = jsonContent.pop();

		var trip = new Trip({ 
				name: 'Test Trip ' + parseInt(Math.random()*10000000000000), 				//Random Name
				pickupTime: Date.parse(pickup["Date/Time"]),												//Mongo saves time as UTC. 
				dropoffTime: Date.parse(dropoff["Date/Time"]),
				pickup: { coordinates: [Number(pickup.Lon), Number(pickup.Lat)]},		//GeoJson format, Point is default type
				dropoff: { coordinates: [Number(dropoff.Lon), Number(dropoff.Lat)]}
			});
		//Create a new file every 50,000 trips to manage filesize.
		//Close the file's array, start a new file and begin again
		if(jsonContent.length % 100000 === 0) { 	
			console.log('\n *Writing New File* \n')
			fileCount++;
			wstream.write(JSON.stringify(trip)+',d');
			wstream.write(']');
			wstream.end();	
			wstream = fs.createWriteStream(inFiles[i]+fileCount);	
			wstream.write('[');
		} else {
			wstream.write(JSON.stringify(trip)+',\n');
		}
	}
	wstream.write(']');
	wstream.end();
}





console.log("\n *EXIT* \n");

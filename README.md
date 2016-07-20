# Anaximander MEAN Geomapping Tool

  - [Installation](#installation)
    - [Ubuntu 14.04 install](#ubuntu-1404-install)
    - [Git clone](#git-clone)
    - [Install Dependencies](#install-dependencies)
  - [Add data to mongo](#add-data-to-mongo)
    - [Quick process](#quick-process)
    - [Full Process](#full-process)
  - [Fixing Mongo Date type](#fixing-mongo-date-type)
  - [Build](#build)
  - [Starting Server](#starting-server)
  - [Configuration](#configuration)
- [Design Decisions](#design-decisions)
    - [Front End](#front-end)
    - [Back End](#back-end)
	- [Tradeoffs](#tradeoffs)
	- [Next Steps](#next-steps)
	  - [Optimization](#optimization)
	  - [Refinement](#refinement)
	  - [Maintainability](#maintainability)
	  - [New Features](#new-features)
	- [Tech](#tech)
- [Usage](#usage)

### Installation

#### Ubuntu 14.04 install

```
sudo apt-get install git node npm node-legacy mongodb
sudo npm install -g bower gulp gulp-cli nodemon
```

some systems use nodejs-legacy.

Some versions require symlinking if node is not found for some packages.

```
ln -s /usr/sbin/node /usr/sbin/nodejs
```

#### Git clone 
```
git clone https://github.com/tenthirtyone/Anaximander.git
```

#### Install Dependencies
```
cd Anaximander && npm install && bower install && cd server && npm install && cd ..
```

### Add data to mongo

#### Quick process
```
cd server/data/example_data
bash importToMongo.sh
```

Mongo will begin importing ~560,000 data points from April 2014, about 5 Minutes on a laptop. The points are paired off into Trip models in a process detailed below.

#### Full Process

Use csvtojson to convert these documents [Uber github repo](https://github.com/fivethirtyeight/Uber-tlc-foil-response/tree/master/Uber-trip-data). 

Mongo has a 16MB limit on file imports. Use the testReader.js script in server/data to slice the data into parts and transform the data into trip structures. Each file contains no more than 50,000 trips. 

```
sudo npm install -g csvtojson
cd server/data && mkdir json
for i in `ls | grep csv`; do  csvtojson $i > $i.json; done
node ../testReader.js
```
This is a long process and could take up to 30 minutes.
```
cd data/data && mv *json?* formatted/ && cd formatted
bash importToMongo.sh
```

### Fixing Mongo Date type
Mongo treats the json date data as a string. Without this part the backend won't be able to find any records. E.g. doing date comparisons on string data.

```
mongo
use Anaximander
db.trips.find( { 'pickupTime' : { $type : 2 } } ).forEach( function (trip) {   
  trip.pickupTime = new Date(trip.pickupTime); // convert field to string
  db.trips.save(trip);
});

db.trips.find( { 'dropoffTime' : { $type : 2 } } ).forEach( function (trip) {   
  trip.dropoffTime = new Date(trip.dropoffTime); // convert field to string
  db.trips.save(trip);
});
```
This will run. If you are doing the long process you can check progress if you open a new terminal and enter mongo and query db.trips.find( { 'pickupTime' : { $type : 2 } } ).count(). Otherwise it will finish in a few minutes.

### Build

```
cd Anaximander
gulp
```
Outputs frontend to 'build' folder. Easy to separate FE and BE later if desired.

### Starting Server

```
cd server
npm start
```
hosts port 3000

### Configuration

```
server/config/config.json
```

Contains port, mongodb location, log location, run mode for logging

### Features
Shows a map of Anaximander 'trip' data
Able to draw an arbitrary shape or geofence on the map, and be able to filter data that is fully contained (begins and ends) within the shape
  - X Be able to answer where the top pickups are for a given shape
  - X Be hosted on Heroku, EC2, or somewhere we can access it by visiting a URL.
  - X Create a heatmap showing trip density for any shape
  - X Filters for time of day, or day/night

Testing. There is no unit testing. No end to end testing. 

## Next Steps
##### Optimization
- Use a library like socket.io to transfer data
- Test/RD limits of Google Maps data points
- Separate Mongo infrastructure, i.e. data sharding
- Queries for pickups only. Probably the easiest way to send 2x as many pickups without changing anything else

#### Refinement
- Improve REST API hypermedia & Result set Metadata
- Additional logging/debugging/unit testing

#### Maintainability
- Need a module and component architecture before going forward. This includes separating the map logic to its own module and analysis/control/filter/query submodules. Every step forward that is not this adds to tech debt. 

#### New Features
- Saving shapes -- Mongo can store drawn shapes. Users can create customize, store and share shapes such as outlines of city neighborhoods, highways, districts, restaurante locations, etc. 
- Animation-Over-Time -- Process data into keyframes/slices by time. View a day's data as a changing/gif-like animation. 
- Directional Traffic -- Identify traffic patterns - more traffic to city center in mornings than evenings? Sporting events? Traffic accidents/street closings?
- New UI
- Authentication

### Tech

* AngularJS
* Bootstrap 3
* Gulp
* Bower
* Npm
* jQuery-lite
* Node
* Express
* Mongo
* Mongoose
* Google Maps

Also a bit of scss. Kind of.

### Usage
The app will automatically load trips around New York for the default values in the Query fields.
##### Statistics
Shows the total returned results. Max 100 for now. Can be changed in the backend service.
##### Query
Accepts a start/end time for trips to query the database. The trashcan button clears the map.
##### Filters
Hides/Shows the pickups and dropoffs for the current data set
##### Controls
Controls for toggling between drawing a geofence on click and panning. Filter button queries db for trips inside the geofence. Undo button to remove last geopoint. The trash button removes the geofence.

Geofence markers are draggable to resize the geofence.

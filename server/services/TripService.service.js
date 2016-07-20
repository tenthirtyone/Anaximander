"use strict";

var config = require("config");
var logger = require("../common/logger");
var Trip = require("../models/Trip.model.js");

function getTrip(tripid, callback) {
  if (!tripid) {
    var blankTrip = Trip({_id: 0});
    return callback(null, blankTrip);
  }
  Trip.findOne({_id: tripid}, function(err, trip){
    if (err) return callback(err)
    return callback(null, trip);
   })
}

function getSocketTrips(query, socket) {  
  var stopTime, startTime;
  startTime = Date.now();

  var pickupTime = new Date(query.pickupTime).toISOString();
  var dropoffTime = new Date(query.dropoffTime).toISOString();

  Trip.find({
    dropoffTime: {
      $lte : new Date(dropoffTime), 
      $gte : new Date(pickupTime)
    },
    pickupTime: {
      $lte : new Date(dropoffTime), 
      $gte : new Date(pickupTime)
    },
    pickup: {
      $geoWithin: {
        $polygon: JSON.parse(query.polygon)
      }
    },
    dropoff: {
      $geoWithin: {
        $polygon: JSON.parse(query.polygon)
      }
    }
  }, 
    function(err, trips) {
    if (err) { console.log(err)}
    socket.emit('trip:data:begin', trips.length)
    trips.forEach(function(trip) {
      socket.emit('trip:data', trip);
    })
    socket.emit('trip:data:finish')
  })
  .limit(25000);
  stopTime = Date.now();
  console.log((stopTime-startTime));
}

function getTrips(query, callback) {
  var pageSize = 100;
  var page = query.pageNumber;

  var pickupTime = new Date(query.pickupTime).toISOString();
  var dropoffTime = new Date(query.dropoffTime).toISOString();

  Trip.find({
    dropoffTime: {
      $lte : new Date(dropoffTime), 
      $gte : new Date(pickupTime)
    },
    pickupTime: {
      $lte : new Date(dropoffTime), 
      $gte : new Date(pickupTime)
    },
    pickup: {
      $geoWithin: {
        $polygon: JSON.parse(query.polygon)
      }
    },
    dropoff: {
      $geoWithin: {
        $polygon: JSON.parse(query.polygon)
      }
    }
  }, 
    function(err, trips) {
    if (err) return callback(err);
    
    return callback(null, trips);
  })
  .skip(pageSize*page)
  .limit(pageSize);
}

module.exports = {  
  getSocketTrips: logger.wrapFunction(getSocketTrips),
  getTrip: logger.wrapFunction(getTrip),
  getTrips: logger.wrapFunction(getTrips)
};
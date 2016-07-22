"use strict";

var config = require("config");
var logger = require("../common/logger");
var Shape = require("../models/Shape.model.js");
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
  var pickupTime = new Date(query.pickupTime).toISOString();
  var dropoffTime = new Date(query.dropoffTime).toISOString();
  var limit = query.limit < 20000 ? query.limit : 20000;

  var poly = JSON.parse(query.polygon);

  if (poly.length > 2) {
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
          $polygon: poly
        }
      },
      dropoff: {
        $geoWithin: {
          $polygon: poly
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
    .limit(limit);
  }
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

function getShape(query, callback) {
  console.log('######')
  console.log(query)
  var shapeName = query.shapename || null;
  if (!shapeName) {
    var blankShape = Shape({_id: 0});
    return callback(null, blankShape);
  }
  Shape.findOne({name: shapeName}, function(err, shape){
    if (err) return callback(err)
    return callback(null, shape);
   })
}

function saveShape(shapeName, shape, callback) {
  shape = JSON.parse(shape);
  // You may not autocomplete your poly
  // ...but I will
  if (shape[0] !== shape[shape.length]) {
    shape.push(shape[0]);      
  }

  var newShape = new Shape({ 
      name: shapeName, 
      shape: { coordinates: [shape] }
    });
  newShape.save(function (err, shape) {
    if (err) return console.error(err);
  });
}

module.exports = {  
  getSocketTrips: logger.wrapFunction(getSocketTrips),
  getTrip: logger.wrapFunction(getTrip),
  getTrips: logger.wrapFunction(getTrips),
  getShape: logger.wrapFunction(getShape),
  saveShape: logger.wrapFunction(saveShape)
};
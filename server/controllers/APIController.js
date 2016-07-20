var express = require("express");
var config = require("config");
var router = express.Router();
var TripService = require("../services/TripService.service.js");
var jsonminify = require("jsonminify");

router.get("/trip", function(req, res) {
	TripService.getTrip(req.headers.tripid, function(err, trip) {
		if (err) res.status(400).send(err);
		res.send(trip);
	})
});

router.get("/trips", function(req, res) {
	TripService.getTrips(req.query || '', function(err, trip) {
		if (err) res.status(400).send(err);
		res.send(trip);
	})
});
/*
router.post("/trip", function(req, res) {
  if (req.body.trip) {
    TripService.saveTrip(req.body.trip, function(err, success){
      if (err) {res.status(400).send('Saving Trip Failed')}
        res.send(jsonminify(success));
    });
  } else {
  	res.status(400).send(req.body);
  }
})*/

module.exports = router;
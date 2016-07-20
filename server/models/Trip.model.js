var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tripSchema = new Schema({
  dropoff : {
    type : {
    	type: String, 
    	default: "Point"}
    	,
    coordinates : [Number]
  },
  pickup : {
    type : {
    	type: String, 
    	default: "Point"
    },
    coordinates : [Number]
  },
  dropoffTime: {type: Date},
  pickupTime: {type: Date},
  name: {type: String, default: ''}
});

tripSchema.index({ dropoff : '2dsphere' });
tripSchema.index({ pickup : '2dsphere' });

var Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
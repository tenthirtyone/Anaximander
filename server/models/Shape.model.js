var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shapeSchema = new Schema({
  shape : {
    type : {
      type: String, 
      default: "Polygon"
    },
    coordinates : []
  }, 
  name: {type: String, default: ''}
});

shapeSchema.index({ shape : '2dsphere' });

var Shape = mongoose.model('Shape', shapeSchema);

module.exports = Shape;
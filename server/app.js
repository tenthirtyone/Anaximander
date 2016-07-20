"use strict";

var config = require('config');
var express = require('express');
var compression = require('compression')
var cors = require('cors');
var helmet = require('helmet');
var winston = require('winston');
var serveStatic = require('serve-static');
var Path = require('path');
var bodyParser = require('body-parser');
var logger = require('./common/logger');
var createDomain = require('domain').create;
var app = express();
var mongoose = require('mongoose')
var socketController = require('./controllers/SocketController');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('port', config.WEB_SERVER_PORT);
mongoose.connect(config.MongoURL);

app.use(compression())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var whitelist = ['http://localhost',
  'http://localhost:3000',
  'http://107.170.59.79/',
  'http://107.170.59.79:3000',
  'http://gamenight.beer',
  'http://gamenight.beer:3000',
 ];

var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  exposedHeaders: 'Authorization'
};

app.use(cors(corsOptions));
app.use(helmet());

app.use("/", express.static("../build/"))
app.use("/api", require("./controllers/APIController")); 

io.on('connection', function(socket){
  console.log('connection');
  socketController.handle(socket);
})


app.use(function (req, res) {
    res.status(404).json({error: "route not found"});
});

app.use(function (err, req, res, next) {//jshint ignore:line
    logger.logFullError(err, req.method + " " + req.url);
    res.status(err.httpStatus || 500).json({
        error: err.message
    });
});

app.get('/*', function (req, res, next) {
  if (req.url.indexOf("/img/*") === 0) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  }
  next();
});

server.listen(app.get('port'), function() {
  winston.info('Express server listening on port %d',
              app.get('port'));
});

logger.log('App Started');
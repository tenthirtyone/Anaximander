var TripService = require("../services/TripService.service.js");

function handle(socket) {
	console.log('Socket Connection Id:\n' + socket.conn.id)
	socket.emit('message', { message: 'connection successful'});
  socket.on('send', function(data) {
    io.socket.emit('message', data);
  });
  socket.on('send:message', function(data) {
    socket.emit('message', { message: 'message successful'});
  })
  socket.on('get:trips', function(data) {
  	console.log('Query:')
    console.log(data.query)
		TripService.getSocketTrips(data.query, socket);
  })
}

module.exports = {
	handle: handle
}
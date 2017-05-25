var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Party = require('./api/models/partyModel'),
  bodyParser = require('body-parser'),
  io = require('socket.io');

mongoose.Promise = global.Promise;
mongoose.connect('localhost::27017');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app);

app.listen(port);
console.log('InTune API started on port: ' + port);

var mongoose = require('mongoose'),
  PartyModel = mongoose.model('Party');
var ioServer = io.listen(3001),
    clients = [];
    
/* ------------------------------------------------delete all parties
PartyModel.remove({}, function(err) {
  console.log(err);
});
*/

// Event fired every time a new client connects:
ioServer.on('connection', function(socket) {
    console.log('New client connected (id=' + socket.id + ').');
    clients.push(socket);

    // When socket disconnects, remove it from the list:
    socket.on('disconnect', function() {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.log('Client gone (id=' + socket.id + ').');
        }
    });

    socket.on('create party', function(req) {
      req = JSON.parse(req);
      var name = req.name;
      var password = req.password;
      var host = req.username;
      var new_party = new PartyModel(
        { name: name, password: password, host: host }
      );
      new_party.save(function(err, party) {
        if (err)
          socket.emit('error', 'There was an error');//could send error to client
        else {
          console.log("here");
          socket.emit('joined party', party.toJSON());
        }
      });
    });

    socket.on('add track', function(req) {
      console.log(req);
      req = JSON.parse(req);
      var uri = req.uri;
      PartyModel.findByIdAndUpdate(req.partyID, {$push: {'tracks': { uri: uri }}}, {safe: true, upsert: true, new : true}, function (err,model) { console.log(err) });
    });

    socket.on('get parties', function() {
      PartyModel.find({}, function(err, party) {
        if (err)
          console.log("yooooo");
        socket.emit('parties', party);

      });
    });
});

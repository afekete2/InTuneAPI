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
    clients = {};

/* ------------------------------------------------delete all parties
PartyModel.remove({}, function(err) {
  console.log(err);
});
*/

// Event fired every time a new client connects:
ioServer.on('connection', function(socket) {
    console.log('New client connected (id=' + socket.id + ').');
    var handshakeData = socket.request;
    var clientID = handshakeData._query['client_id'];
    clients[clientID] = socket;
    console.log(clientID);

    // When socket disconnects, remove it from the list:
    socket.on('disconnect', function() {
      /*
        var index = clients.indexOf(clientID);
        if (index != -1) {
            clients.splice(index, 1);
            console.log('Client gone (id=' + socket.id + ').');
        }
        */
        clients[clientID] = null;
        console.log('Client gone (id=' + socket.id + ').');
    });

    socket.on('create party', function(req) {
      req = JSON.parse(req);
      var name = req.name;
      var password = req.password;
      var host = req.host;
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

    socket.on('join party', function(req) {
      console.log(req);
      req = JSON.parse(req);
      var name = req.name;
      PartyModel.findByIdAndUpdate(req.partyID, {$push: {'guests': name}}, {safe: true, upsert: true, new : true}, function (err,model) {
        console.log(err);
        socket.emit("joined party", model.toJSON());
      });
    });

    socket.on('add track', function(req) {
      console.log(req);
      req = JSON.parse(req);
      var uri = req.uri;
      var name = req.name;
      var artists = req.artists;
      PartyModel.findByIdAndUpdate(req.partyID, {$push: {'tracks': { uri: uri, name: name, artists: artists }}}, {safe: true, upsert: true, new : true}, function (err,model) {
        clients[model.host].emit("track added", req);
        for (var i = 0; i < model.guests.length; i++) {
          clients[model.guests[i]].emit("track added", req);
        }
      });
      //socket.emit("track added", req);
    });

    socket.on('get parties', function() {
      PartyModel.find({}, function(err, party) {
        if (err)
          console.log(err);
        socket.emit('parties', party);

      });
    });

    socket.on('get tracks', function(req) {
      PartyModel.findById(req.partyID, function(err, party) {
        if (err)
          console.log(err);
        socket.emit('tracks received', party.tracks);

      });
    });
});

'use strict';

var mongoose = require('mongoose'),
  Party = mongoose.model('Party');

exports.list_all_parties = function(req, res) {
  Party.find({}, function(err, party) {
    if (err)
      res.send(err);
    res.json(party);
  });
};


exports.create_a_party = function(req, res) {
  var name = req.body.name;
  var password = req.body.password;
  var host = req.connection.remoteAddress;
  console.log(req.body);
  var new_party = new Party(
    { name: name, password: password, host: host }
  );
  new_party.save(function(err, party) {
    if (err)
      res.send(err);
    res.json(party);
  });
};


exports.read_a_party = function(req, res) {
  Party.findById(req.params.partyId, function(err, party) {
    if (err)
      res.send(err);
    res.json(party);
  });
};


exports.update_a_party = function(req, res) {
  Party.findOneAndUpdate(req.params.partyId, req.body, {new: true}, function(err, party) {
    if (err)
      res.send(err);
    res.json(party);
  });
};


exports.delete_a_party = function(req, res) {


  Party.remove({
    _id: req.params.partyId
  }, function(err, party) {
    if (err)
      res.send(err);
    res.json({ message: 'Party successfully deleted' });
  });
};

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PartySchema = new Schema({
  name: {
    type: String,
    Required: 'Kindly enter the name of the task'
  },
  password: {
    type: String,
    Required: 'Password required.'
  },
  host: {
    type: String,
    Required: 'Host required'
  },
  guests: [String],
  tracks: [{
    uri: {type: String},
    name: {type: String},
    artists: [String]
  }]
});

module.exports = mongoose.model('Party', PartySchema);

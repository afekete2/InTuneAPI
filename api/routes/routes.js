'use strict';
module.exports = function(app) {
  var party = require('../controllers/partyController');


  // todoList Routes
  app.route('/parties')
    .get(party.list_all_parties)
    .post(party.create_a_party);


  app.route('/party/:partyId')
    .get(party.read_a_party)
    .put(party.update_a_party)
    .delete(party.delete_a_party);
};

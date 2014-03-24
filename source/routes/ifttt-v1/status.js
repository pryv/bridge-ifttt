var db = require('../storage/database.js');
var config = require('../utils/config');
var request = require('request-json');
var hat = require('hat');


var domain =  '.' + config.get('pryv:domain');
var access =  request.newClient(config.get('pryv:access'));


module.exports = function setup(app) {

  // Show the current server status
  app.get('/ifttt/v1/status', function (req, res /*, next*/) {
    var response = {
      data: {
        status: 'OK',
        time: (new Date()).toISOString()
      }
    };
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(200);
    res.send(JSON.stringify(response));
  });
};
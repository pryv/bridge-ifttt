
var PYError = require('../errors/PYError.js');
var db = require('../storage/database.js');

var pryv = require('pryv');
var config = require('../utils/config');


var channelApiKey = config.get('ifttt:channelApiKey');

module.exports =  function (req, res, next) {

  if (! req.get('Authorization')) {
    return next();
  } else {


    var authorizarionHeader = req.get('Authorization').split(' ');
    if (authorizarionHeader.length !== 2) {
      return next(PYError.authentificationRequired('Authorization header bad number of arguments'));
    }
    var oauthToken = authorizarionHeader[1];
    if (authorizarionHeader[0] !== 'Bearer' || !oauthToken) {
      return next(PYError.authentificationRequired('Authorization header bad content'));
    }

    if (oauthToken === channelApiKey) { //-- route /ifttt/v1/test/setup
      req.setupAuthorized = true;
      return next(); // break
    }


    db.getSet(oauthToken, function (error, credentials) {
      if (error) {
        return next(PYError.internalError('Database error'));
      }
      if (!credentials || !credentials.username) {
        return next(PYError.invalidToken());
      }
      req.pryvCredentials = credentials;
      req.pryvConnection = new pryv.Connection({
        username: req.pryvCredentials.username,
        auth: req.pryvCredentials.pryvToken,
        staging: config.get('pryv:staging')
      });

      next();
    });
  }

};


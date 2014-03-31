
var errorMessages = require('../utils/error-messages.js');
var db = require('../storage/database.js');

var pryv = require('pryv');
var config = require('../utils/config');

module.exports =  function (req, res, next) {

  if (! req.get('Authorization')) {
    return next();
  } else {


    var authorizarionHeader = req.get('Authorization').split(' ');
    if (authorizarionHeader.length !== 2) {
      return errorMessages.sendContentError(res, 'Authorization header too many arguments');
    }
    var oauthToken = authorizarionHeader[1];
    if (authorizarionHeader[0] !== 'Bearer' || !oauthToken) {
      return errorMessages.sendContentError(res, 'Authorization header bad content');
    }
    db.getSet(oauthToken, function (error, credentials) {
      if (error) {
        return errorMessages.sendInternalError(res, 'Database error');
      }
      if (!credentials || !credentials.username) {
        return errorMessages.sendInvalidToken(res);
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


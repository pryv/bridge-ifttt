
var utils = require('../utils/utils.js');
var db = require('../storage/database.js');


module.exports =  function (req, res, next) {

  if (! req.get('Authorization')) {
    return next();
  } else {
    var authorizarionHeader = req.get('Authorization').split(' ');
    if (authorizarionHeader.length !== 2) {
      return utils.sendContentError(res, 'Authorization header too many arguments');
    }
    var oauthToken = authorizarionHeader[1];
    if (authorizarionHeader[0] !== 'Bearer' || !oauthToken) {
      return utils.sendContentError(res, 'Authorization header bad content');
    }
    db.getSet(oauthToken, function (error, credentials) {
      if (error) {
        return utils.sendInternalError(res, 'Database error');
      }
      if (!credentials || !credentials.username) {
        return utils.sendInvalidToken(res);
      }
      req.pryvCredentials = credentials;
      next();
    });
  }

};


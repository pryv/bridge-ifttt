
const PYError = require('../errors/PYError.js');
const db = require('../storage/database.js');

const url = require('url');
const config = require('../utils/config');
const pryv = require('pryv');

const channelApiKey = config.get('ifttt:channelApiKey');
const domain = config.get('pryv:domain');

module.exports =  function (req, res, next) {

  if (! req.get('Authorization')) {
    //---- test related part
    if (req.get('IFTTT-Channel-Key')) {
      if (req.get('IFTTT-Channel-Key') !== channelApiKey) { //-- route /ifttt/v1/test/setup
        return next(PYError.authentificationRequired('IFTTT-Channel-Key header bad content'));
      }
      req.iftttAuthorized = true;
    }
    return next();
  } else {
    var authorizationHeader = req.get('Authorization').split(' ');
    if (authorizationHeader.length !== 2) {
      return next(PYError.authentificationRequired('Authorization header bad number of arguments'));
    }
    var oauthToken = authorizationHeader[1];


    if (authorizationHeader[0] !== 'Bearer' || !oauthToken) {
      return next(PYError.authentificationRequired('Authorization header bad content'));
    }

    //--- end of test related part

    db.getSet(oauthToken, function (error, credentials) {
      if (error) {
        return next(PYError.internalError('Database error', '', error));
      }
      if (credentials == null ||
        (credentials.username == null && credentials.urlEndpoint == null)
      ) {
        return next(PYError.invalidToken());
      }
      
      if (credentials.urlEndpoint != null) {
        const url = credentials.urlEndpoint;
        credentials.username = url.substring(8, url.length - domain.length + 1);
      }

      req.pryvCredentials = credentials;
      
      req.pryvConnection = {
        urlEndpoint: credentials.urlEndpoint || 'https://' + credentials.username + '.' + domain,
        auth: credentials.pryvToken,
        username: credentials.username // for retro-compatibility, see cache
      };

      next();
    });
  }

};


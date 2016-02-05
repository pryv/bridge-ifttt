
var PYError = require('../errors/PYError.js');
var db = require('../storage/database.js');

var pryv = require('pryv');
var config = require('../utils/config');

//var testData = require('../../test/test-data');

var channelApiKey = config.get('ifttt:channelApiKey');

var staging = config.get('pryv:staging');

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

    var doIstage = staging;
    //-- in testing scheme mode , switch to pryv.in
    /*if (oauthToken === testData.oauthToken) {
      // doIstage = true;
      // Not anymore (since dec 2015 no staging operational)
    } */

    //--- end of test related part

    db.getSet(oauthToken, function (error, credentials) {
      if (error) {
        return next(PYError.internalError('Database error', '', error));
      }
      if (!credentials || !credentials.username) {
        return next(PYError.invalidToken());
      }

      req.pryvCredentials = credentials;
      req.pryvConnection = new pryv.Connection({
        username: req.pryvCredentials.username,
        auth: req.pryvCredentials.pryvToken,
        staging: doIstage
      });

      next();
    });
  }

};


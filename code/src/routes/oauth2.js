var PYError = require('../errors/PYError.js');
var db = require('../storage/database.js');
var config = require('../utils/config');
var request = require('superagent');
var hat = require('hat');


var accessUrl = config.get('pryv:access');

var secretPath = config.get('oauth:secretPath');
const domain = config.get('pryv:domain');

module.exports = function setup(app) {

  // Show them the "do you authorise xyz app to access your content?" page
  app.get('/oauth2/authorise', function (req, res, next) {
    var parameters = {
      //sso: req.signedCookies.sso,
      requestingAppId: req.query.client_id,
      requestedPermissions: [
        {streamId : '*', level: 'manage'},
        {streamId : 'ifttt', defaultName: 'IFTTT', level: 'manage'}
      ], // TODO adapt to clientId
      languageCode: 'en',
      returnURL: req.query.redirect_uri + '?',
      oauthState: req.query.state
    };

    request.post(accessUrl).send(parameters).end(function (error, response) {
      if (! error && response.status !== 201) {
        error = new Error('Failed requesting access from register invalid statusCode:' +
          response.status + ' body:' + response.body);
      }
      if (! error && ! response.body.url) {
        error = new Error('Invalid response, missing url:' + response.body);
      }
      if (error) {
        return next(error); // TODO forge a JSON error
      }

      res.redirect(response.body.url);
    });
  });


  // Show them the exchange the bearer for a real token
  app.post('/oauth2' + secretPath + '/token', function (req, res, next) {
    var code = req.body.code;
    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;
    var redirect_uri = req.body.redirect_uri;

    if (!client_id || client_id !== config.get('ifttt:clientId')) {
      return next(PYError.contentError('Bad secret'));
    }
    if (!client_secret || client_secret !== config.get('ifttt:secret')) {
      return next(PYError.contentError('Bad secret'));
    }
    if (!code) {
      return next(PYError.contentError('Code missing'));
    }
    if (!redirect_uri) {
      return next(PYError.contentError('code parameter missing'));
    }

    /**
     * TODO
     * 1- check client_secret / client_id
     * 2- get username / token from access
     */

    request.get(accessUrl + '/' + code).end(function (error, response) {
      if (response.body.status === 'ACCEPTED') {

        const username = response.body.username;
        const pryvToken = response.body.token;

        if (! response.body.username || ! response.body.token) {
          return next(PYError.internalError('token from access'));
        }

        var credentials = { urlEndpoint: buildUrl(username, domain), pryvToken: pryvToken};
        var oauthToken = hat();

        db.setSet(oauthToken, credentials);
        return res.json({token_type: 'Bearer', access_token: oauthToken});
      }

      return next(PYError.invalidToken());
    });

  });
};

function buildUrl(username, domain) {
  return 'https://' + username + '.' + domain;
}
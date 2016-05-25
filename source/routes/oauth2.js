var PYError = require('../errors/PYError.js');
var db = require('../storage/database.js');
var config = require('../utils/config');
var request = require('superagent');
var hat = require('hat');


//var access = request.createClient(config.get('pryv:access'));
var accessUrl = config.get('pryv:access');

var secretPath = config.get('oauth:secretPath');

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

    request.poost(accessUrl + '/access').send(parameters).end(function (error, res) {
      if (! error && response.statusCode !== 201) {
        error = new Error('Failed requesting access from register invalid statusCode:' +
          response.statusCode + ' body:' + body);
      }
      if (! error && ! body.url) {
        error = new Error('Invalid response, missing url:' + body);
      }
      if (error) {
        return next(error); // TODO forge a JSON error
      }
      res.redirect(body.url);
    });
    /*
    access.post('/access', parameters,
      function (error, response, body) {

        if (! error && response.statusCode !== 201) {
          error = new Error('Failed requesting access from register invalid statusCode:' +
            response.statusCode + ' body:' + body);
        }
        if (! error && ! body.url) {
          error = new Error('Invalid response, missing url:' + body);
        }
        if (error) {
          return next(error); // TODO forge a JSON error
        }
        res.redirect(body.url);
      }
    );*/
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

    request.get(accessUrl + '/access/' + code).end(function (error, res) {
      if (res.body.status === 'ACCEPTED') {

        if (! res.body.username || ! res.body.token) {
          return next(PYError.internalError('token from access'));
        }

        var credentials = { username: res.body.username, pryvToken: res.body.token};
        var oauthToken = hat();

        db.setSet(oauthToken, credentials);
        return res.json({token_type: 'Bearer', access_token: oauthToken});
      }

      return next(PYError.invalidToken());
    });
    /*
    access.get('/access/' + code,
      function (error, response, body) {

        if (body.status === 'ACCEPTED') {

          if (! body.username || ! body.token) {
            return next(PYError.internalError('token from access'));
          }

          var credentials = { username: body.username, pryvToken: body.token};
          var oauthToken = hat();

          db.setSet(oauthToken, credentials);
          return res.json({token_type: 'Bearer', access_token: oauthToken});
        }

        return next(PYError.invalidToken());
      }
    );
    */

  });
};

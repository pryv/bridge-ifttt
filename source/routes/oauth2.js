var db = require('../storage/database.js');
var config = require('../utils/config');
var request = require('request-json');
var hat = require('hat');


var access =  request.newClient(config.get('pryv:access'));


module.exports = function setup(app) {

  // Show them the "do you authorise xyz app to access your content?" page
  app.get('/oauth2/authorise', function (req, res, next) {
    var parameters = {
      //sso: req.signedCookies.sso,
      requestingAppId: req.query.client_id,
      requestedPermissions: [ {streamId : '*', level: 'manage'} ], // TODO adapt to clientId
      languageCode: 'en',
      returnURL: req.query.redirect_uri + '?',
      oauthState: req.query.state
    };

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
    );
  });


  // Show them the exchange the bearer for a real token
  app.post('/oauth2/token', function (req, res /*, next*/) {
    var code = req.body.code;
    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;
    var redirect_uri = req.body.redirect_uri;

    if (!client_id || client_id !== config.get('ifttt:clientId')) {
      return sendContentError(res, 'Bad secret');
    }
    if (!client_secret || client_secret !== config.get('ifttt:secret')) {
      return sendContentError(res, 'Bad secret');
    }
    if (!code) {
      return sendContentError(res, 'Code missing');
    }
    if (!redirect_uri) {
      return sendContentError(res, 'code parameter missing');
    }

    /**
     * TODO
     * 1- check client_secret / client_id
     * 2- get username / token from access
     */


    access.get('/access/' + code,
      function (error, response, body) {

        if (body.status === 'ACCEPTED') {

          if (! body.username || ! body.token) {
            return sendInternalError(res, 'invalid username / token from access');
          }

          var credentials = { username: body.username, pryvToken: body.token};
          var oauthToken = hat();

          db.setSet(oauthToken, credentials);
          return res.json({token_type: 'Bearer', access_token: oauthToken});
        }

        return sendInvalidToken(res);
      }
    );

  });
};


function sendInvalidToken(res) {
  return res.send('Invalid token', 401);
}

function sendInternalError(res, message) {
  return res.send('Internal Error:' + message, 500);
}

function sendContentError(res, message) {
  var response = { errors: [ {message: message} ] };
  return res.send(JSON.stringify(response), 400);
}


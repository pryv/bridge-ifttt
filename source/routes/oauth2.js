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

    console.log(access);


    access.post('/access', parameters,
      function (error, response, body) {

        console.log(error);

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
    var notValid = false;

    /**
     * TODO
     * 1- check client_secret / client_id
     * 2- get username / token from access
     */
    if (notValid) {
      return sendInvalidToken(res);
    }

    access.get('/access/' + req.body.code,
      function (error, response, body) {

        if (body.status === 'ACCEPTED') {

          if (! body.username || ! body.token) {
            return sendInternalError(res, 'invaling username / token from access');
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


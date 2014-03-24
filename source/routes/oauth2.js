var db = require('../storage/database.js');
var config = require('../utils/config');
var request = require('request-json');
var hat = require('hat');


var domain =  '.' + config.get('pryv:domain');
var access =  request.newClient(config.get('pryv:access'));


module.exports = function setup(app) {


  //https://api.example-channel.org/oauth2/authorize?client_id=94b26e58a3a88d5c&response_type=code
  // &redirect_uri=https%3A%2F%2Fifttt.com%2Fchannels%2Fexample-channel%2Fauthorize&scope=ifttt
  // &state=a00caec8dbd08e50

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
    var notValid = false;

    //grant_type=authorization_code&code=67a8ad40341224c1&client_id=83465ab42&
    // client_secret=c4f7defe91df9b23&
    // redirect_uri=https%3A//ifttt.com/channels/channel-slug/authorize

    /**
     * TODO
     * 1- check client_secret / client_id
     * 2- get username / token from access
     */
    if (notValid) {
      return res.send('Invalid credentials', 401);
    }

    access.get('/access/' + req.body.code,
      function (error, response, body) {

        if (body.status === 'ACCEPTED') {
          var credentials = { username: body.username, pryvToken: body.token};
          var oauthToken = hat();

          db.setSet(oauthToken, credentials);
          return res.json({token_type: 'Bearer', access_token: oauthToken});
        }

      }
    );




  });

  // Return the user info
  app.get('/ifttt/v1/user/info', function (req, res /*, next*/) {

    var authorizarionHeader = req.get('Authorization').split(' ');

    // verify token..
    if (!authorizarionHeader) {
      return res.send(getErrorMsg('Authorization header missing'), 400);
    }

    if (authorizarionHeader.length !== 2) {
      return res.send(getErrorMsg('Authorization header too many arguments'), 400);
    }

    var oauthToken = authorizarionHeader[1];
    if (authorizarionHeader[0] !== 'Bearer' || !oauthToken) {
      return res.send(getErrorMsg('Authorization header bad content'), 400);
    }



    db.getSet(oauthToken, function (error, credentials) {

      if (error) {
        return res.send('Internal database error', 500);
      }

      if (! credentials.username) {
        return res.send('Invalid token', 401);
      }
      return res.json({ data : {
        name: credentials.username,
        id: credentials.username,
        url: 'https://' + credentials.username + domain
      }});
    });
  });



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

function getErrorMsg(msg) {
  return { errors: [ {message: msg} ] };
}

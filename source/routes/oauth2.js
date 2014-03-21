var db = require('../storage/database.js');
var config = require('../utils/config');
var request = require('request');

var accessUrl =  config.get('pryv:access');

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

    console.log(parameters);

    request.post(accessUrl, parameters,
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
  app.get('/oauth2/token', function (req, res, next) {
    var parameters = {
      //sso: req.signedCookies.sso,
      requestingAppId: req.query.client_id,
      requestedPermissions: [ {streamId : '*', level: 'manage'} ], // TODO adapt to clientId
      languageCode: 'en',
      returnURL: req.query.redirect_uri + '?',
      oauthState: req.query.state
    };

    res.redirect('https://abcd.epfl.ch');
  });

  // Return the user info
  app.get('/ifttt/v1/user/info', function (req, res, next) {
    var response, status;
    var token = req.get('Authorization').split(' ')[1];

    // verify token..
    if(token) {
      var name = 'Walter White';
      var id = 'heisenberg';

      response = {
        data: {
          name: name,
          id: id }
      };
      status  = 200;
    } else {
      response = {errors: [{message: 'Invalid token'}]};
      status = 401;
    }

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(status);
    res.send(JSON.stringify(response));
  });



  // Show the current server status
  app.get('/ifttt/v1/status', function (req, res, next) {
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

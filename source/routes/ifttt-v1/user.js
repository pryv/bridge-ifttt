var db = require('../../storage/database.js');

module.exports = function setup(app) {

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
};

function getErrorMsg(msg) {
  return { errors: [ {message: msg} ] };
}


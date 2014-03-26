var errorMessages = require('../../utils/error-messages');

var config = require('../../utils/config');
var domain =  '.' + config.get('pryv:domain');

module.exports = function setup(app) {

// Return the user info
  app.get('/ifttt/v1/user/info', function (req, res /*, next*/) {
    if (!req.pryvCredentials) {
      errorMessages.sendContentError(res, 'No authorization token');
    }
    else {
      return res.json({ data : {
        name: req.pryvCredentials.username,
        id: req.pryvCredentials.username,
        url: 'https://' + req.pryvCredentials.username + domain
      }});
    }
  });
};


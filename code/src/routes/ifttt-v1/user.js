var PYError = require('../../errors/PYError.js');

var config = require('../../utils/config');
var domain =  '.';
domain += (config.get('pryv:domain') === 'pryv.in') ? 'pryv.li' : 'pryv.me';

module.exports = function setup(app) {

// Return the user info
  app.get('/ifttt/v1/user/info', function (req, res, next) {
    if (!req.pryvCredentials) {
      return next(PYError.contentError('No authorization token'));
    } else {
      return res.json({ data : {
        name: req.pryvCredentials.username,
        id: req.pryvCredentials.username,
        url: 'https://' + req.pryvCredentials.username + domain
      }});
    }
  });
};


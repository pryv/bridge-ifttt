const PYError = require('../../errors/PYError.js');

const config = require('../../utils/config');
const domain = config.get('pryv:domain');

module.exports = function setup(app) {

// Return the user info
  app.get('/ifttt/v1/user/info', function (req, res, next) {
    const pryvCredentials = req.pryvCredentials;
    if (! pryvCredentials) {
      return next(PYError.contentError('No authorization token'));
    } else {
      if (pryvCredentials.urlEndpoint != null) {
        return res.json({
          name: pryvCredentials.urlEndpoint,
          id: pryvCredentials.urlEndpoint,
          url: pryvCredentials.urlEndpoint,
        });
      } else {
        return res.json({
          name: pryvCredentials.username,
          id: pryvCredentials.username,
          url: 'https://' + pryvCredentials.username + '.' + domain
        });
      }
    }
  });
};

